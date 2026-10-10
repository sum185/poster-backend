'use strict';

const express = require('express');
const auth = require('../auth');
const { logActivity } = require('../seed');

const router = express.Router();

router.get('/login', auth.redirectIfAuth, (req, res) => {
  res.render('login', {
    title: 'Admin Login',
    error: null,
    email: '',
    next: req.query.next || '/dashboard',
  });
});

router.post('/login', auth.redirectIfAuth, (req, res) => {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');
  const next = req.body.next || '/dashboard';

  const admin = auth.findAdminByEmail(email);
  const ok = admin && auth.verifyPassword(password, admin.password_hash);

  if (!ok) {
    return res.status(401).render('login', {
      title: 'Admin Login',
      error: 'Invalid email or password.',
      email,
      next,
    });
  }

  req.session.admin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
  logActivity(admin.name, 'Logged in');

  // Only allow local redirects.
  const target = typeof next === 'string' && next.startsWith('/') ? next : '/dashboard';
  return res.redirect(target);
});

router.post('/logout', (req, res) => {
  const admin = req.session && req.session.admin;
  if (admin) logActivity(admin.name, 'Logged out');
  req.session.destroy(() => {
    res.clearCookie('poster.sid');
    res.redirect('/login');
  });
});

module.exports = router;
