'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/users', (req, res) => {
  const admins = db
    .prepare('SELECT id, name, email, role, created_at FROM admins ORDER BY id ASC')
    .all();

  res.render('users', {
    title: 'Admins',
    admin: req.session.admin,
    admins,
    active: 'users',
  });
});

module.exports = router;
