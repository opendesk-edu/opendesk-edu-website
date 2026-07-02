import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "newsletter.db");

function getDb(): Database.Database {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      confirmed INTEGER NOT NULL DEFAULT 0
    )
  `);

  return db;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const db = getDb();

    const existing = db
      .prepare("SELECT id, confirmed FROM subscribers WHERE email = ?")
      .get(email) as { id: number; confirmed: number } | undefined;

    if (existing) {
      db.close();
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    db.prepare("INSERT INTO subscribers (email) VALUES (?)").run(email);
    db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[subscribe] Failed:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
