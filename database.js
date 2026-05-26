const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database:', dbPath);
    initializeTables();
  }
});

// Helper functions to use promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function initializeTables() {
  db.serialize(async () => {
    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      url TEXT,
      description TEXT,
      date TEXT,
      category TEXT DEFAULT 'Билим берүү',
      tags TEXT DEFAULT ''
    )`);

    // Dynamic schema update for projects (adds category and tags if missing)
    db.all("PRAGMA table_info(projects)", (err, columns) => {
      if (!err && columns) {
        const hasCategory = columns.some(c => c.name === 'category');
        const hasTags = columns.some(c => c.name === 'tags');
        if (!hasCategory) {
          db.run("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'Билим берүү'", (alterErr) => {
            if (alterErr) console.error("Error altering projects (category):", alterErr.message);
          });
        }
        if (!hasTags) {
          db.run("ALTER TABLE projects ADD COLUMN tags TEXT DEFAULT ''", (alterErr) => {
            if (alterErr) console.error("Error altering projects (tags):", alterErr.message);
          });
        }
      }
    });

    // Gallery table
    db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      url TEXT,
      date TEXT
    )`);

    // Videos table
    db.run(`CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      url TEXT,
      date TEXT
    )`);

    // Resume table
    db.run(`CREATE TABLE IF NOT EXISTS resume (
      id INTEGER PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      url TEXT,
      description TEXT,
      date TEXT
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT
    )`);

    // Settings table (key-value metadata configuration)
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // Seed default settings and data if empty
    try {
      const settingsCount = await get("SELECT COUNT(*) as count FROM settings");
      if (settingsCount.count === 0) {
        await run("INSERT INTO settings (key, value) VALUES ('admin_password', 'ayperi2026')");
        await run("INSERT INTO settings (key, value) VALUES ('telegram_bot_token', '')");
        await run("INSERT INTO settings (key, value) VALUES ('telegram_chat_id', '')");
        console.log("Seeded default settings configuration.");
      }

      const projectCount = await get("SELECT COUNT(*) as count FROM projects");
      if (projectCount.count === 0) {
        await seedDefaultData();
      }
    } catch (err) {
      console.error("Error seeding tables/settings:", err.message);
    }
  });
}

async function seedDefaultData() {
  console.log("Seeding default data...");
  
  // Seed projects
  await run(`INSERT INTO projects (id, title, status, url, description, date) VALUES 
    (1, 'Билим берүү платформасы', 'Активдүү', 'https://ayperi.kg/projects/edu', 'Жаштар арасында билим деңгээлин жогорулатуу жана инновациялык технологияларды колдонууну жайылтуу багытында эл аралык демилге.', '2024-03-15'),
    (2, 'Санариптик Мурас Платформасы', 'Активдүү', 'https://ayperi.kg/projects/heritage', 'Кыргыз маданий мурастарын санариптештирүү жана заманбап форматта жаштарга жеткирүү боюнча интерактивдүү долбоор.', '2023-11-20')
  `);

  // Seed gallery
  await run(`INSERT INTO gallery (id, title, status, url, date) VALUES 
    (1, 'Enactus Улуттук Конкурсу 2023', 'Активдүү', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', '2023-06-12'),
    (2, 'Илимий конференциядагы презентация', 'Активдүү', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800', '2024-02-18'),
    (3, 'Студенттик мобилдүүлүк программасы', 'Активдүү', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', '2023-10-05')
  `);

  // Seed videos
  await run(`INSERT INTO videos (id, title, status, url, date) VALUES 
    (1, 'Enactus долбоорунун презентациясы', 'Активдүү', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '2023-05-25'),
    (2, 'Билим берүү маанисиндеги видеоролик', 'Активдүү', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '2024-01-10')
  `);

  // Seed resume
  await run(`INSERT INTO resume (id, category, title, status, url, description, date) VALUES 
    (1, '0', 'Республикалык олимпиада - I орун', 'Активдүү', '', 'Биология багыты боюнча республикалык деңгээлдеги олимпиадада 1-орунду камсыз кылуу.', '2022-04-20'),
    (2, '2', 'Жаштар ишкердигин колдоо демилгеси', 'Активдүү', '', 'Enactus командасынын алкагында социалдык ишкердик долбоорду иштеп чыгуу жана ишке ашыруу.', '2023-09-10'),
    (3, '3', 'Жаш окумуштуулар форуму', 'Активдүү', '', 'Эл аралык студенттик илимий-практикалык конференцияда баяндама жасоо жана диплом менен сыйлануу.', '2023-11-15')
  `);
  
  console.log("Seeding completed successfully.");
}

module.exports = {
  db,
  run,
  all,
  get
};
