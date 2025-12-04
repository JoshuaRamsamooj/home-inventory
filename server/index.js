import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, 'server_startup.log');

function log(message) {
    const msg = `${new Date().toISOString()} - ${message}\n`;
    try {
        fs.appendFileSync(logFile, msg);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
    console.log(message);
}

log('Starting server initialization...');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- LOCATIONS ---
app.get('/api/locations', (req, res) => {
    db.all('SELECT * FROM locations', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/locations', (req, res) => {
    const { name, description, bins, shelves } = req.body;

    if (!name) {
        console.error('Missing name in request body');
        return res.status(400).json({ error: 'Name is required' });
    }

    // Direct insertion without transaction for debugging stability
    db.run('INSERT INTO locations (name, description) VALUES (?, ?)', [name, description], function (err) {
        if (err) {
            console.error('Error inserting location:', err);
            return res.status(500).json({
                error: err.message || 'Unknown database error',
                code: err.code
            });
        }

        const locationId = this.lastID;

        if (bins && Array.isArray(bins)) {
            bins.forEach(binName => {
                db.run('INSERT INTO bins (name, location_id) VALUES (?, ?)', [binName, locationId], (err) => {
                    if (err) console.error('Error inserting bin:', binName, err);
                });
            });
        }

        if (shelves && Array.isArray(shelves)) {
            shelves.forEach(shelfName => {
                db.run('INSERT INTO shelves (name, location_id) VALUES (?, ?)', [shelfName, locationId], (err) => {
                    if (err) console.error('Error inserting shelf:', shelfName, err);
                });
            });
        }

        res.json({ data: { id: locationId, name, description, bins, shelves } });
    });
});

app.put('/api/locations/:id', async (req, res) => {
    const { name, description, bins, shelves } = req.body;
    const locationId = req.params.id;

    // Helper to wrap db.run in a promise
    const run = (sql, params) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    // Helper to wrap db.all in a promise
    const all = (sql, params) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    try {
        await run('UPDATE locations SET name = ?, description = ? WHERE id = ?', [name, description, locationId]);

        const syncChildren = async (tableName, children) => {
            if (!children) return;

            // 1. Get existing IDs
            const rows = await all(`SELECT id FROM ${tableName} WHERE location_id = ?`, [locationId]);
            const existingIds = rows.map(r => r.id);
            const incomingIds = children.filter(c => c.id).map(c => c.id);

            // 2. Delete removed
            const toDelete = existingIds.filter(id => !incomingIds.includes(id));
            for (const id of toDelete) {
                await run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            }

            // 3. Update or Insert
            for (const child of children) {
                if (child.id) {
                    await run(`UPDATE ${tableName} SET name = ? WHERE id = ?`, [child.name, child.id]);
                } else {
                    await run(`INSERT INTO ${tableName} (name, location_id) VALUES (?, ?)`, [child.name, locationId]);
                }
            }
        };

        await syncChildren('bins', bins);
        await syncChildren('shelves', shelves);

        res.json({ data: { id: locationId, name, description, bins, shelves } });
    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/locations/:id', (req, res) => {
    db.run('DELETE FROM locations WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'deleted', changes: this.changes });
    });
});

// --- BINS ---
app.get('/api/bins', (req, res) => {
    db.all('SELECT * FROM bins', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/bins', (req, res) => {
    const { name, location_id } = req.body;
    db.run('INSERT INTO bins (name, location_id) VALUES (?, ?)', [name, location_id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: { id: this.lastID, name, location_id } });
    });
});

app.put('/api/bins/:id', (req, res) => {
    const { name, location_id } = req.body;
    db.run('UPDATE bins SET name = ?, location_id = ? WHERE id = ?', [name, location_id, req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: { id: req.params.id, name, location_id } });
    });
});

app.delete('/api/bins/:id', (req, res) => {
    db.run('DELETE FROM bins WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'deleted', changes: this.changes });
    });
});

// --- SHELVES ---
app.get('/api/shelves', (req, res) => {
    db.all('SELECT * FROM shelves', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/shelves', (req, res) => {
    const { name, location_id } = req.body;
    db.run('INSERT INTO shelves (name, location_id) VALUES (?, ?)', [name, location_id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: { id: this.lastID, name, location_id } });
    });
});

app.put('/api/shelves/:id', (req, res) => {
    const { name, location_id } = req.body;
    db.run('UPDATE shelves SET name = ?, location_id = ? WHERE id = ?', [name, location_id, req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: { id: req.params.id, name, location_id } });
    });
});

app.delete('/api/shelves/:id', (req, res) => {
    db.run('DELETE FROM shelves WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'deleted', changes: this.changes });
    });
});

// --- TAGS ---
app.get('/api/tags', (req, res) => {
    db.all('SELECT * FROM tags', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Helper to handle tags for an item
const handleItemTags = async (itemId, tags) => {
    if (!tags || !Array.isArray(tags)) return;

    // 1. Clear existing tags for this item
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM item_tags WHERE item_id = ?', [itemId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // 2. Process each tag
    for (const tag of tags) {
        let tagId;
        const tagName = typeof tag === 'string' ? tag : tag.name;

        if (!tagName) continue;

        // Find or create tag
        try {
            const row = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (row) {
                tagId = row.id;
            } else {
                // Create new tag
                const result = await new Promise((resolve, reject) => {
                    db.run('INSERT INTO tags (name) VALUES (?)', [tagName], function (err) {
                        if (err) reject(err);
                        else resolve(this);
                    });
                });
                tagId = result.lastID;
            }

            // Link item to tag
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tagId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

        } catch (e) {
            console.error('Error processing tag:', tagName, e);
        }
    }
};

// Get items with pagination, sorting, and filtering
app.get('/api/items', (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = 'name',
        order = 'asc',
        search = '',
        location_id = 'all'
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
        whereClause += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    if (location_id !== 'all') {
        whereClause += ` AND i.location_id = ?`;
        params.push(location_id);
    }

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['name', 'quantity', 'createdAt', 'updatedAt'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const countSql = `SELECT COUNT(*) as total FROM items i ${whereClause}`;

    const dataSql = `
        SELECT i.*, 
               json_group_array(json_object('id', t.id, 'name', t.name)) as tags
        FROM items i
        LEFT JOIN item_tags it ON i.id = it.item_id
        LEFT JOIN tags t ON it.tag_id = t.id
        ${whereClause}
        GROUP BY i.id
        ORDER BY i.${sortColumn} ${sortColumn === 'name' ? 'COLLATE NOCASE' : ''} ${sortOrder}
        LIMIT ? OFFSET ?
    `;

    db.get(countSql, params, (err, countRow) => {
        if (err) {
            console.error('Error counting items:', err);
            return res.status(500).json({ error: err.message });
        }

        const total = countRow ? countRow.total : 0;
        const totalPages = Math.ceil(total / limit);

        // Add limit and offset to params for data query
        const dataParams = [...params, limit, offset];

        db.all(dataSql, dataParams, (err, rows) => {
            if (err) {
                console.error('Error fetching items:', err);
                return res.status(500).json({ error: err.message });
            }

            const items = rows.map(item => ({
                ...item,
                tags: item.tags ? JSON.parse(item.tags).filter(t => t.id !== null) : []
            }));

            res.json({
                data: items,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages
                }
            });
        });
    });
});

// Create item
app.post('/api/items', async (req, res) => {
    const { id, name, description, quantity, location_id, bin_id, shelf_id, tags, createdAt } = req.body;
    const sql = `INSERT INTO items (id, name, description, quantity, location_id, bin_id, shelf_id, createdAt) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, name, description, quantity, location_id, bin_id, shelf_id, createdAt];

    try {
        await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });

        await handleItemTags(id, tags);

        res.json({
            message: 'success',
            data: req.body,
            id: id // Use provided ID
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
    const { name, description, quantity, location_id, bin_id, shelf_id, tags } = req.body;
    const sql = `UPDATE items set 
               name = ?, 
               description = ?, 
               quantity = ?, 
               location_id = ?, 
               bin_id = ?, 
               shelf_id = ?, 
               updatedAt = ? 
               WHERE id = ?`;

    const params = [name, description, quantity, location_id, bin_id, shelf_id, new Date().toISOString(), req.params.id];

    try {
        await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });

        await handleItemTags(req.params.id, tags);

        res.json({
            message: 'success',
            data: req.body
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
    const sql = 'DELETE FROM items WHERE id = ?';
    db.run(sql, req.params.id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'deleted', changes: this.changes });
    });
});

app.use((err, req, res, next) => {
    log(`Unhandled Express Error: ${err.message}`);
    console.error('Unhandled Express Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`);
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection: ${reason}`);
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
});
