import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteFile, getUploadDir } from "@/lib/upload";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import Busboy from "busboy";

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "需要 multipart/form-data" }, { status: 400 });
  }

  const body = request.body;
  if (!body) {
    return NextResponse.json({ error: "请求体为空" }, { status: 400 });
  }

  const dir = getUploadDir("video");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
  const filepath = path.join(dir, filename);

  try {
    const fileWritten = await new Promise<boolean>((resolve, reject) => {
      const busboy = Busboy({
        headers: { "content-type": contentType },
        limits: { fileSize: 250 * 1024 * 1024 },
      });

      let fileReceived = false;
      let writeFinished = false;
      let busboyFinished = false;

      const tryResolve = () => {
        if (writeFinished && busboyFinished) resolve(true);
      };

      busboy.on("file", (_fieldname, stream, info) => {
        fileReceived = true;
        const writable = fs.createWriteStream(filepath);

        stream.on("limit", () => {
          writable.destroy();
          reject(new Error("文件超过 250MB 限制"));
        });

        writable.on("finish", () => {
          writeFinished = true;
          tryResolve();
        });
        writable.on("error", reject);

        stream.pipe(writable);
      });

      busboy.on("finish", () => {
        busboyFinished = true;
        if (!fileReceived) {
          resolve(false);
        } else {
          tryResolve();
        }
      });

      busboy.on("error", reject);

      const nodeStream = Readable.fromWeb(body as import("stream/web").ReadableStream);
      nodeStream.pipe(busboy);
    });

    if (!fileWritten || !fs.existsSync(filepath)) {
      return NextResponse.json({ error: "未收到文件" }, { status: 400 });
    }

    const db = getDb();
    const key = "invitation_video";
    const old = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    if (old?.value) {
      deleteFile(old.value);
    }

    const url = `/uploads/video/${filename}`;
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .run(key, url, url);

    return NextResponse.json({ url });
  } catch (e) {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    const msg = e instanceof Error ? e.message : "上传处理失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
