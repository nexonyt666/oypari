const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration to support split deployment (e.g. Netlify frontend + Render API)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password']
}));

async function sendTelegramNotification(name, email, textMsg) {
    try {
        const tokenRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_bot_token'");
        const chatIdRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_chat_id'");
        const token = tokenRow ? tokenRow.value : '';
        const chatId = chatIdRow ? chatIdRow.value : '';

        if (!token || !chatId) return;

        const formattedText = `🔔 *Жаңы Кабар (Сайттан)*\n\n👤 *Аты:* ${name}\n📧 *Email:* ${email}\n✉️ *Кабар:* ${textMsg}`;
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: formattedText,
                parse_mode: 'Markdown'
            })
        });
    } catch (err) {
        console.error('[Telegram Notify Error]', err.message);
    }
}

app.use(express.json());

// Simple Admin Authentication middleware (Async database check)
async function requireAdmin(req, res, next) {
    const password = req.headers['x-admin-password'];
    try {
        const row = await db.get("SELECT value FROM settings WHERE key = 'admin_password'");
        const adminPass = row ? row.value : 'ayperi2026';
        if (password === adminPass) {
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized: Incorrect admin password.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database authentication check error.' });
    }
}

// Authentication check endpoint
app.post('/api/auth-check', async (req, res) => {
    const { password } = req.body;
    try {
        const row = await db.get("SELECT value FROM settings WHERE key = 'admin_password'");
        const adminPass = row ? row.value : 'ayperi2026';
        if (password === adminPass) {
            res.json({ authenticated: true });
        } else {
            res.status(401).json({ authenticated: false, error: 'Incorrect password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database check error.' });
    }
});

// Temporary password reset endpoint (Delete after use)
app.get('/api/reset-password-temp', async (req, res) => {
    try {
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', 'ayperi2026')");
        res.send("Password successfully reset to: ayperi2026. Please log in and let me know so I can remove this endpoint.");
    } catch (err) {
        res.status(500).send("Error resetting password: " + err.message);
    }
});


// --- STATS ENDPOINT ---
app.get('/api/stats', (req, res) => {
    res.json({
        years: 3,
        projects: 15,
        certificates: 20,
        satisfaction: 100
    });
});

// --- SKILLS ENDPOINT ---
app.get('/api/skills', (req, res) => {
    res.json([
        { name: 'Лидерлик & Башкаруу', percentage: 95, category: 'leadership' },
        { name: 'Долбоор жазуу', percentage: 85, category: 'management' },
        { name: 'Эл алдында сүйлөө', percentage: 90, category: 'communication' },
        { name: 'Англис тили', percentage: 80, category: 'language' }
    ]);
});

// --- TIMELINE ENDPOINT ---
app.get('/api/timeline', (req, res) => {
    res.json([
        {
            year: '2024',
            title: 'Эл аралык Долбоорлор',
            desc: 'Билим берүү жана жаштар саясаты боюнча эл аралык деңгээлдеги кызматташуу жана долбоорлор.',
            icon: 'Globe'
        },
        {
            year: '2023',
            title: 'Enactus Жетекчилиги',
            desc: 'Команданы алдыга баштоо жана социалдык ишкердик боюнча долбоорлорду ишке ашыруу.',
            icon: 'Briefcase'
        },
        {
            year: '2022',
            title: 'Олимпиада Жеңүүчүсү',
            desc: 'Илимий олимпиадаларда жогорку көрсөткүчтөр, биринчи жана экинчи орундар.',
            icon: 'Award'
        },
        {
            year: '2021',
            title: 'Жаңы Кадамдар',
            desc: 'Жогорку билимге болгон алгачкы кадамдар жана студенттик активдүүлүктүн башталышы.',
            icon: 'GraduationCap'
        }
    ]);
});

// --- CONTACT ENDPOINT ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Бардык талааларды толтуруңуз.' });
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    
    try {
        // Save message to SQLite
        await db.run(
            "INSERT INTO messages (name, email, message, date) VALUES (?, ?, ?, ?)",
            [name, email, message, dateStr]
        );
        
        // Dispatch Telegram bot notification asynchronously
        sendTelegramNotification(name, email, message);
        
        console.log(`[Contact] Saved message from ${name} <${email}>`);
        res.json({ success: true, message: 'Кабарыңыз жөнөтүлдү! Жакын убакта байланышабыз.' });
    } catch (err) {
        console.error('[Contact Save Error]', err.message);
        res.status(500).json({ success: false, error: 'Кабар сактоо учурунда ката кетти.' });
    }
});

// --- MESSAGES ENDPOINTS (Admin only) ---
app.get('/api/messages', requireAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM messages ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM messages WHERE id = ?", [id]);
        res.json({ success: true, message: 'Кабар өчүрүлдү.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const { id, title, status, url, description, date, category, tags } = req.body;
    try {
        const queryId = id || Date.now();
        const queryDate = date || new Date().toISOString().split('T')[0];
        const queryCategory = category || 'Билим берүү';
        const queryTags = tags || '';
        await db.run(
            "INSERT INTO projects (id, title, status, url, description, date, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [queryId, title, status, url, description, queryDate, queryCategory, queryTags]
        );
        res.status(201).json({ id: queryId, title, status, url, description, date: queryDate, category: queryCategory, tags: queryTags });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, status, url, description, date, category, tags } = req.body;
    try {
        const queryCategory = category || 'Билим берүү';
        const queryTags = tags || '';
        await db.run(
            "UPDATE projects SET title = ?, status = ?, url = ?, description = ?, date = ?, category = ?, tags = ? WHERE id = ?",
            [title, status, url, description, date, queryCategory, queryTags, id]
        );
        res.json({ id: Number(id), title, status, url, description, date, category: queryCategory, tags: queryTags });
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
                    "INSERT OR REPLACE INTO projects (id, title, status, url, description, date, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [item.id, item.title, item.status, item.url, item.description, item.date, item.category || 'Билим берүү', item.tags || '']
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

// --- SETTINGS ENDPOINTS (Admin only) ---
app.get('/api/settings', requireAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT key, value FROM settings");
        const settingsObj = {};
        rows.forEach(r => {
            if (r.key !== 'admin_password') {
                settingsObj[r.key] = r.value;
            }
        });
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', requireAdmin, async (req, res) => {
    const { telegram_bot_token, telegram_chat_id, new_password } = req.body;
    try {
        if (telegram_bot_token !== undefined) {
            await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('telegram_bot_token', ?)", [telegram_bot_token]);
        }
        if (telegram_chat_id !== undefined) {
            await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('telegram_chat_id', ?)", [telegram_chat_id]);
        }
        if (new_password) {
            await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', ?)", [new_password]);
        }
        res.json({ success: true, message: 'Жөндөөлөр ийгиликтүү сакталды.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/test-telegram', requireAdmin, async (req, res) => {
    try {
        const tokenRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_bot_token'");
        const chatIdRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_chat_id'");
        const token = tokenRow ? tokenRow.value : '';
        const chatId = chatIdRow ? chatIdRow.value : '';

        if (!token) {
            return res.status(400).json({ success: false, error: 'Telegram Bot Token жазылган эмес!' });
        }
        if (!chatId) {
            return res.status(400).json({ success: false, error: 'Telegram Chat ID жазылган эмес!' });
        }

        const formattedText = `🔔 *Тест Билдирүү (AYPERI)*\n\nКуттуктайбыз! Сиздин Telegram Бот ийгиликтүү иштеп жатат! 🎉`;
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const tgRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: formattedText,
                parse_mode: 'Markdown'
            })
        });

        const tgData = await tgRes.json();
        if (tgRes.ok && tgData.ok) {
            res.json({ success: true, message: 'Тест билдирүү Telegram аккаунтуңузга жөнөтүлдү!' });
        } else {
            res.status(400).json({ success: false, error: tgData.description || 'Telegram катасы кетти.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Serve PDF files
app.use('/pdf', express.static(path.join(__dirname)));

// Serve static assets (CSS, JS, images, fonts) from React build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve the index.html for all other routes to support React Router SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
