const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Database initialization
const db = new sqlite3.Database('./arttisian.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                tier TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }
});

// Routes
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    const sql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, message], function (err) {
        if (err) {
            console.error('Error inserting contact:', err.message);
            return res.status(500).json({ error: 'Failed to save contact information.' });
        }
        res.status(200).json({ message: 'Contact message received successfully!', id: this.lastID });
    });
});

app.post('/api/subscribe', (req, res) => {
    const { email, tier } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Please provide an email address.' });
    }

    const sql = `INSERT INTO subscriptions (email, tier) VALUES (?, ?)`;
    db.run(sql, [email, tier || 'General'], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'This email is already subscribed.' });
            }
            console.error('Error inserting subscription:', err.message);
            return res.status(500).json({ error: 'Failed to save subscription.' });
        }
        res.status(200).json({ message: 'Subscription successful!', id: this.lastID });
    });
});

// Admin Routes (to view data)
app.get('/api/admin/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/subscriptions', (req, res) => {
    db.all('SELECT * FROM subscriptions ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
