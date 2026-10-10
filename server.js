const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { Pool } = require('pg');

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
let pool;

// ---- Auth middleware ----
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login');
}

// ---- Routes ----
app.get('/', (req, res) => {
  res.redirect(req.session.isAdmin ? '/admin' : '/login');
});

app.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'html_pages', 'login.html'));
});

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

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'html_pages', 'dashboard.html'));
});

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

// Categories API
app.get('/api/categories', requireAuth, async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY created_at ASC');
    res.json(categories.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]);
    res.json({ success: true, id: result.rows[0].id, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save category. Might already exist.' });
  }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    await pool.query('UPDATE categories SET name = $1 WHERE id = $2', [name, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Templates API
app.get('/api/templates', requireAuth, async (req, res) => {
  try {
    const templates = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(templates.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', requireAuth, async (req, res) => {
  try {
    const { name, category, image_data } = req.body;
    
    const existing = await pool.query('SELECT id FROM templates WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A template with this name already exists' });
    }

    const result = await pool.query(
      'INSERT INTO templates (name, category, image_data) VALUES ($1, $2, $3) RETURNING id',
      [name, category, image_data]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

app.delete('/api/templates/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM templates WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// PUBLIC API
app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY created_at ASC');
    res.json(categories.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/public/templates', async (req, res) => {
  try {
    const templates = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(templates.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/api/public/templates/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const templates = await pool.query('SELECT * FROM templates WHERE category = $1 ORDER BY created_at DESC', [category]);
    res.json(templates.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.use((req, res) => res.status(404).send('404 - Not Found'));

// Start server
async function initDB() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/poster_db';
  pool = new Pool({
    connectionString,
    ssl: (process.env.POSTGRES_URL || process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image_data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  const catCount = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (parseInt(catCount.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO categories (name) VALUES 
      ('Diwali'), ('Birthday'), ('Political'), ('Daily Quote')
      ON CONFLICT DO NOTHING;
    `);
  }
  console.log('✅ PostgreSQL Database connected successfully.');
  adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
}

// For local development
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
      console.log(`Login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
    });
  });
} else {
  // For Vercel serverless functions, init DB asynchronously. 
  // (In production with high traffic, a top-level await or separate connection logic might be better)
  initDB().catch(console.error);
}

module.exports = app;
