import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      thumbnail TEXT,
      alt TEXT DEFAULT '',
      category TEXT NOT NULL CHECK(category IN ('gallery', 'wedding')),
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT DEFAULT '',
      active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rsvp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      attending TEXT NOT NULL CHECK(attending IN ('yes', 'no')),
      guests INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS map_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('wish', 'visit', 'rsvp')),
      city TEXT NOT NULL,
      province TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      count INTEGER DEFAULT 1,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, city)
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      ip TEXT,
      city TEXT,
      province TEXT,
      user_agent TEXT,
      referrer TEXT,
      entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER DEFAULT 0,
      page_path TEXT DEFAULT '/'
    );
    CREATE INDEX IF NOT EXISTS idx_pv_entered ON page_views(entered_at);
    CREATE INDEX IF NOT EXISTS idx_pv_ip ON page_views(ip);
    CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id);
  `);

  const cols = db.prepare("PRAGMA table_info(wishes)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "city")) {
    db.exec("ALTER TABLE wishes ADD COLUMN city TEXT DEFAULT NULL");
  }

  // Migrate map_locations to support 'rsvp' type (SQLite CHECK is immutable)
  try {
    db.prepare("INSERT INTO map_locations (type, city, lat, lng) VALUES ('rsvp', '__test__', 0, 0)").run();
    db.prepare("DELETE FROM map_locations WHERE city = '__test__'").run();
  } catch {
    db.exec(`
      ALTER TABLE map_locations RENAME TO map_locations_old;
      CREATE TABLE map_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('wish', 'visit', 'rsvp')),
        city TEXT NOT NULL,
        province TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        count INTEGER DEFAULT 1,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(type, city)
      );
      INSERT INTO map_locations (id, type, city, province, lat, lng, count, last_seen)
        SELECT id, type, city, province, lat, lng, count, last_seen FROM map_locations_old;
      DROP TABLE map_locations_old;
    `);
  }
}
