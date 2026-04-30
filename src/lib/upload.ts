import path from "path";
import fs from "fs";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");

export function getUploadDir(subdir: string): string {
  const dir = path.join(UPLOAD_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveFile(file: File, subdir: string): Promise<string> {
  const dir = getUploadDir(subdir);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${subdir}/${filename}`;
}

export async function savePhoto(file: File): Promise<{ url: string; thumbnail: string }> {
  const dir = getUploadDir("photos");
  const ext = ".jpg";
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${base}${ext}`;
  const thumbFilename = `${base}_thumb${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await sharp(buffer)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(path.join(dir, filename));

  await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 70 })
    .toFile(path.join(dir, thumbFilename));

  return {
    url: `/uploads/photos/${filename}`,
    thumbnail: `/uploads/photos/${thumbFilename}`,
  };
}

export function deleteFile(urlPath: string): void {
  const filepath = path.join(UPLOAD_DIR, urlPath.replace("/uploads/", ""));
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}
