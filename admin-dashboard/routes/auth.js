const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Hardcoded admin credentials (in production, use database)
// Username: 7096536027, Password: 185185185
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '7096536027';
const ADMIN_PASSWORD_HASH = '$2b$10$vAOG8sMECjuymu4Xmb9qpuT5cG40vUFYmRptlU9nsqSinH2dlL3zq'; // bcrypt hash of '185185185'

// GET Login Page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('login', {
    pageTitle: 'Admin Login',
    error: null,
    oldInput: { username: '' }
  });
});

// POST Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('login', {
      pageTitle: 'Admin Login',
      error: errors.array()[0].msg,
      oldInput: { username: req.body.username }
    });
  }

  const { username, password } = req.body;

  // Check username
  if (username !== ADMIN_USERNAME) {
    return res.status(401).render('login', {
      pageTitle: 'Admin Login',
      error: 'Invalid username or password',
      oldInput: { username }
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  
  if (!isMatch) {
    return res.status(401).render('login', {
      pageTitle: 'Admin Login',
      error: 'Invalid username or password',
      oldInput: { username }
    });
  }

  // Generate JWT token
  const token = generateToken({
    id: 1,
    username: ADMIN_USERNAME,
    role: 'admin'
  });

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  });

  res.redirect('/dashboard');
});

// GET Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
});

module.exports = router;