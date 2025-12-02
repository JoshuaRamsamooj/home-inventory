import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'inventory.db');

const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    console.log('Initializing database tables...');
    db.serialize(() => {
        // Drop tables to reset schema (Development only)
        // db.run("DROP TABLE IF EXISTS items");
        // db.run("DROP TABLE IF EXISTS areas");
        // db.run("DROP TABLE IF EXISTS locations");
        // db.run("DROP TABLE IF EXISTS bins");
        // db.run("DROP TABLE IF EXISTS shelves");

        db.run(`CREATE TABLE IF NOT EXISTS locations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
)`, (err) => {
            if (err) console.error('Error creating locations table:', err);
            else console.log('Locations table ready');
        });

        db.run(`CREATE TABLE IF NOT EXISTS bins(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location_id INTEGER,
    FOREIGN KEY(location_id) REFERENCES locations(id)
)`, (err) => {
            if (err) console.error('Error creating bins table:', err);
            else console.log('Bins table ready');
        });

        db.run(`CREATE TABLE IF NOT EXISTS shelves(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location_id INTEGER,
    FOREIGN KEY(location_id) REFERENCES locations(id)
)`, (err) => {
            if (err) console.error('Error creating shelves table:', err);
            else console.log('Shelves table ready');
        });

        db.run(`CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      quantity INTEGER,
      location_id INTEGER,
      bin_id INTEGER,
      shelf_id INTEGER,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY(location_id) REFERENCES locations(id),
      FOREIGN KEY(bin_id) REFERENCES bins(id),
      FOREIGN KEY(shelf_id) REFERENCES shelves(id)
    )`, (err) => {
            if (err) console.error('Error creating items table:', err);
            else console.log('Items table ready');
        });

        db.run(`CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`, (err) => {
            if (err) console.error('Error creating tags table:', err);
            else console.log('Tags table ready');
        });

        db.run(`CREATE TABLE IF NOT EXISTS item_tags (
      item_id TEXT,
      tag_id INTEGER,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )`, (err) => {
            if (err) console.error('Error creating item_tags table:', err);
            else console.log('Item_tags table ready');
        });
    });
}

export default db;
