const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/inventory.db');
console.log('Testing DB connection to:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
        if (err) {
            console.error('Error querying tables:', err);
        } else {
            console.log('Tables found:', rows.map(r => r.name));
        }
    });

    db.all("SELECT * FROM locations LIMIT 1", [], (err, rows) => {
        if (err) {
            console.error('Error querying locations:', err);
        } else {
            console.log('Locations query success:', rows);
        }
    });
});

db.close((err) => {
    if (err) console.error('Error closing db:', err.message);
    else console.log('Database connection closed.');
});
