const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple Admin Authentication middleware
const ADMIN_PASSWORD = 'ayperi2026';
function requireAdmin(req, res, next) {
    const password = req.headers['x-admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Incorrect admin password.' });
    }
}

// Authentication check endpoint
app.post('/api/auth-check', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false, error: 'Incorrect password' });
    }
});

// --- PROJECTS ENDPOINTS ---
app.get('/api/projects', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM projects ORDER BY date DESC, id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', requireAdmin, async (req, res) => {
    const { id, title, status, url, description, date } = req.body;
    try {
        const queryId = id || Date.now();
        const queryDate = date || new Date().toISOString().split('T')[0];
        await db.run(
            "INSERT INTO projects (id, title, status, url, description, date) VALUES (?, ?, ?, ?, ?, ?)",
            [queryId, title, status, url, description, queryDate]
        );
        res.status(201).json({ id: queryId, title, status, url, description, date: queryDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, status, url, description, date } = req.body;
    try {
        await db.run(
            "UPDATE projects SET title = ?, status = ?, url = ?, description = ?, date = ? WHERE id = ?",
            [title, status, url, description, date, id]
        );
        res.json({ id: Number(id), title, status, url, description, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM projects WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GALLERY ENDPOINTS ---
app.get('/api/gallery', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM gallery ORDER BY date DESC, id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/gallery', requireAdmin, async (req, res) => {
    const { id, title, status, url, date } = req.body;
    try {
        const queryId = id || Date.now();
        const queryDate = date || new Date().toISOString().split('T')[0];
        await db.run(
            "INSERT INTO gallery (id, title, status, url, date) VALUES (?, ?, ?, ?, ?)",
            [queryId, title, status, url, queryDate]
        );
        res.status(201).json({ id: queryId, title, status, url, date: queryDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/gallery/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, status, url, date } = req.body;
    try {
        await db.run(
            "UPDATE gallery SET title = ?, status = ?, url = ?, date = ? WHERE id = ?",
            [title, status, url, date, id]
        );
        res.json({ id: Number(id), title, status, url, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/gallery/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM gallery WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- VIDEOS ENDPOINTS ---
app.get('/api/videos', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM videos ORDER BY date DESC, id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/videos', requireAdmin, async (req, res) => {
    const { id, title, status, url, date } = req.body;
    try {
        const queryId = id || Date.now();
        const queryDate = date || new Date().toISOString().split('T')[0];
        await db.run(
            "INSERT INTO videos (id, title, status, url, date) VALUES (?, ?, ?, ?, ?)",
            [queryId, title, status, url, queryDate]
        );
        res.status(201).json({ id: queryId, title, status, url, date: queryDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/videos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, status, url, date } = req.body;
    try {
        await db.run(
            "UPDATE videos SET title = ?, status = ?, url = ?, date = ? WHERE id = ?",
            [title, status, url, date, id]
        );
        res.json({ id: Number(id), title, status, url, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/videos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM videos WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RESUME ENDPOINTS ---
app.get('/api/resume', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM resume ORDER BY date DESC, id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/resume', requireAdmin, async (req, res) => {
    const { id, category, title, status, url, description, date } = req.body;
    try {
        const queryId = id || Date.now();
        const queryDate = date || new Date().toISOString().split('T')[0];
        await db.run(
            "INSERT INTO resume (id, category, title, status, url, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [queryId, category, title, status, url, description, queryDate]
        );
        res.status(201).json({ id: queryId, category, title, status, url, description, date: queryDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/resume/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { category, title, status, url, description, date } = req.body;
    try {
        await db.run(
            "UPDATE resume SET category = ?, title = ?, status = ?, url = ?, description = ?, date = ? WHERE id = ?",
            [category, title, status, url, description, date, id]
        );
        res.json({ id: Number(id), category, title, status, url, description, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/resume/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM resume WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BATCH IMPORT FROM LOCALSTORAGE ---
app.post('/api/import', requireAdmin, async (req, res) => {
    const { projects, gallery, videos, resume } = req.body;
    try {
        if (projects && Array.isArray(projects)) {
            for (const item of projects) {
                await db.run(
                    "INSERT OR REPLACE INTO projects (id, title, status, url, description, date) VALUES (?, ?, ?, ?, ?, ?)",
                    [item.id, item.title, item.status, item.url, item.description, item.date]
                );
            }
        }
        if (gallery && Array.isArray(gallery)) {
            for (const item of gallery) {
                await db.run(
                    "INSERT OR REPLACE INTO gallery (id, title, status, url, date) VALUES (?, ?, ?, ?, ?)",
                    [item.id, item.title, item.status, item.url, item.date]
                );
            }
        }
        if (videos && Array.isArray(videos)) {
            for (const item of videos) {
                await db.run(
                    "INSERT OR REPLACE INTO videos (id, title, status, url, date) VALUES (?, ?, ?, ?, ?)",
                    [item.id, item.title, item.status, item.url, item.date]
                );
            }
        }
        if (resume && Array.isArray(resume)) {
            for (const item of resume) {
                await db.run(
                    "INSERT OR REPLACE INTO resume (id, category, title, status, url, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [item.id, item.category, item.title, item.status, item.url, item.description, item.date]
                );
            }
        }
        res.json({ success: true, message: 'Data imported successfully to SQLite database.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static assets (CSS, JS, images, fonts) from React build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve the index.html for all other routes to support React Router SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
