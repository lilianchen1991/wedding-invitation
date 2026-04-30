import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT DEFAULT NULL,
    photo TEXT DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const settings: [string, string][] = [
  [“groom_name”, “张三”],
  [“bride_name”, “李四”],
  [“wedding_date”, “2026-10-01”],
  [“rsvp_deadline”, “2026-09-20”],
  [“logo_title”, “Z & L”],
  [“logo_desc”, “LOGO 以新郎（Z）与新娘（L）的首字母为核心创作原型，将两个字母进行极简融合设计。”],
  [“ceremony_datetime”, “2026年10月1日 上午 11:18”],
  [“ceremony_venue”, “幸福酒店 · 宴会厅”],
  [“ceremony_address”, “北京市朝阳区幸福路 88 号”],
  [“ceremony_note”, “诚邀您共同见证我们的幸福时刻”],
  [“venue_lat”, “39.9042”],
  [“venue_lng”, “116.4074”],
  [“venue_keyword”, “幸福酒店”],
  [“venue_city”, “北京”],
];

const upsert = db.prepare(
  "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
);

for (const [key, value] of settings) {
  upsert.run(key, value);
}
console.log(`Inserted ${settings.length} settings`);

const milestones = [
  { date: "1995.01.01", title: "他来到这个世界", content: "冬日里的一份礼物，他带着温暖降临。" },
  { date: "1996.06.15", title: "她来到这个世界", content: "夏日里的一抹明媚，她带着笑意而来。" },
  { date: "2020.03.14", title: "初次相遇", content: "那一天，我们的故事悄然开始。" },
  { date: "2021.05.20", title: "确定心意", content: "当心动变成心定，我们决定携手走下去。" },
  { date: "2025.12.25", title: "许下承诺", content: "交换戒指的那一刻，未来有了最笃定的方向。" },
  { date: "2026.10.01", title: "携手一生", content: "在亲朋好友的见证下，我们将许下一生的承诺。" },
];

const existing = db.prepare("SELECT COUNT(*) as c FROM milestones").get() as { c: number };
if (existing.c === 0) {
  const insert = db.prepare(
    "INSERT INTO milestones (date, title, content, link, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  );
  milestones.forEach((m: Record<string, unknown>, i: number) => {
    insert.run(m.date, m.title, m.content, (m as { link?: string }).link || null, null, i);
  });
  console.log(`Inserted ${milestones.length} milestones`);
} else {
  console.log(`Milestones table already has ${existing.c} rows, skipping`);
}

console.log("Done!");
