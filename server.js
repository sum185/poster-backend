const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Admin credentials (change these in production / use env vars) ----
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Password hash is generated at startup (bcrypt)
let adminPasswordHash;
let db;

// ---- Auth middleware ----
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  // API requests -> 401, pages -> redirect to login
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login');
}

// ---- Routes ----

// Root
app.get('/', (req, res) => {
  res.redirect(req.session.isAdmin ? '/admin' : '/login');
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'html_pages', 'login.html'));
});

// Login submit
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const match =
    username === ADMIN_USERNAME &&
    (await bcrypt.compare(String(password || ''), adminPasswordHash));

  if (match) {
    req.session.isAdmin = true;
    req.session.username = username;
    return res.redirect('/admin');
  }
  res.redirect('/login?error=1');
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Dashboard page (protected)
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'html_pages', 'dashboard.html'));
});

// Dashboard stats API (protected)
app.get('/api/stats', requireAuth, (req, res) => {
  res.json({
    user: req.session.username,
    stats: {
      totalUsers: 1284,
      totalPosts: 342,
      revenue: 84500,
      growth: 12.5,
    },
    recentActivity: [
      { id: 1, action: 'New user registered', detail: 'priya@example.com', time: '2 min ago' },
      { id: 2, action: 'Post published', detail: 'Summer Sale Poster', time: '18 min ago' },
      { id: 3, action: 'Payment received', detail: '₹1,200.00', time: '1 hr ago' },
      { id: 4, action: 'New user registered', detail: 'rahul@example.com', time: '3 hr ago' },
      { id: 5, action: 'Post updated', detail: 'Festival Offer Poster', time: '5 hr ago' },
    ],
  });
});

// Categories API (protected)
app.get('/api/categories', requireAuth, async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY created_at ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
    res.json({ success: true, id: result.lastID, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save category. Might already exist.' });
  }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Templates API (protected)
app.get('/api/templates', requireAuth, async (req, res) => {
  try {
    const templates = await db.all('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', requireAuth, async (req, res) => {
  try {
    const { name, category, image_data } = req.body;
    
    // Check if template with same name exists
    const existing = await db.get('SELECT id FROM templates WHERE name = ?', [name]);
    if (existing) {
      return res.status(400).json({ error: 'A template with this name already exists' });
    }

    const result = await db.run(
      'INSERT INTO templates (name, category, image_data) VALUES (?, ?, ?)',
      [name, category, image_data]
    );
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

app.delete('/api/templates/:id', requireAuth, async (req, res) => {
  try {
    await db.run('DELETE FROM templates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ----------------------------------------------------
// PUBLIC API (For Mobile App / End Users)
// ----------------------------------------------------

app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY created_at ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/public/templates', async (req, res) => {
  try {
    const templates = await db.all('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/api/public/templates/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const templates = await db.all('SELECT * FROM templates WHERE category = ? ORDER BY created_at DESC', [category]);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// 404
app.use((req, res) => res.status(404).send('404 - Not Found'));

// ---- Start server ----
async function main() {
  // Database connection
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Insert some default categories if table is empty
  const catCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    await db.exec(`
      INSERT INTO categories (name) VALUES 
      ('Diwali'), ('Birthday'), ('Political'), ('Daily Quote');
    `);
  }
  console.log('✅ SQLite Database connected successfully.');

  adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
    console.log(`Login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
  });
}

main();
