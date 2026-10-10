require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global variables for views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.pageTitle = 'Admin Dashboard';
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', verifyToken, dashboardRoutes);

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { pageTitle: 'Server Error', error: err });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});