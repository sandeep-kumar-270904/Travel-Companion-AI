import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`SQLite Connection Error: ${err.message}`);
  } else {
    logger.info(`SQLite Connected to ${dbPath}`);
    initDB();
  }
});

const INITIAL_COMPANIONS = [
  { name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah", match: 94, destination: "Tokyo, Japan", dates: "Oct 12 - Oct 20", interests: "Food, Culture, Photography", bio: "Solo traveler looking for someone to explore hidden food alleys in Shinjuku!" },
  { name: "David Chen", avatar: "https://i.pravatar.cc/150?u=david", match: 88, destination: "Paris, France", dates: "Nov 05 - Nov 15", interests: "Art, History, Wine", bio: "First time in Paris. Need a buddy for the Louvre and evening wine tastings." },
  { name: "Elena Rodriguez", avatar: "https://i.pravatar.cc/150?u=elena", match: 91, destination: "Kyoto, Japan", dates: "Oct 15 - Oct 22", interests: "Temples, Hiking, Nature", bio: "Planning to do the Fushimi Inari hike early morning. Join me?" },
  { name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus", match: 85, destination: "Rome, Italy", dates: "Sep 20 - Sep 28", interests: "History, Pasta, Architecture", bio: "Looking for fellow history nerds to explore the Colosseum and Roman Forum." }
];

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS companions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      match INTEGER,
      destination TEXT NOT NULL,
      dates TEXT NOT NULL,
      interests TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if table is empty, if so, seed it
    db.get("SELECT COUNT(*) AS count FROM companions", (err, row) => {
      if (!err && row.count === 0) {
        logger.info("Seeding SQLite DB with initial companions...");
        const stmt = db.prepare(`INSERT INTO companions (name, avatar, match, destination, dates, interests, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const comp of INITIAL_COMPANIONS) {
          stmt.run(comp.name, comp.avatar, comp.match, comp.destination, comp.dates, comp.interests, comp.bio);
        }
        stmt.finalize();
      }
    });
  });
}

// Wrapper for promises
export const dbQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;
