'use strict';

const path = require('node:path');
const express = require('express');
const session = require('express-session');

const config = require('./config');
const auth = require('./auth');
require('./seed'); // ensures tables are seeded on boot

const app = express();

// View engine --------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(config.rootDir, 'views'));

// Core middleware ----------------------------------------------------------
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(config.rootDir, 'public'), { maxAge: '1h' }));

app.use(
  session({
    name: 'poster.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// Expose helpers to every view --------------------------------------------
app.use((req, res, next) => {
  res.locals.currentAdmin = req.session.admin || null;
  res.locals.year = new Date().getFullYear();
  next();
});

// Public routes ------------------------------------------------------------
app.use('/', require('./routes/auth'));

// Protected routes ---------------------------------------------------------
app.use('/', auth.requireAuth, require('./routes/dashboard'));
app.use('/', auth.requireAuth, require('./routes/posters'));
app.use('/', auth.requireAuth, require('./routes/users'));

// 404 ----------------------------------------------------------------------
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) return res.render('error', { title: 'Not found', code: 404, message: 'Page not found', admin: req.session.admin });
  return res.json({ error: 'Not found' });
});

// Error handler ------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  if (req.accepts('html')) return res.render('error', { title: 'Server error', code: 500, message: 'Something went wrong', admin: req.session.admin });
  return res.json({ error: 'Server error' });
});

module.exports = app;
