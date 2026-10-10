const express = require('express');

const router = express.Router();

// Mock data for dashboard
const getDashboardStats = () => ({
  totalUsers: 1245,
  totalOrders: 342,
  revenue: 45680,
  conversionRate: 3.2,
  recentOrders: [
    { id: 1001, customer: 'John Doe', amount: 299.99, status: 'Completed', date: '2026-10-10' },
    { id: 1002, customer: 'Jane Smith', amount: 149.50, status: 'Processing', date: '2026-10-09' },
    { id: 1003, customer: 'Bob Wilson', amount: 89.99, status: 'Shipped', date: '2026-10-09' },
    { id: 1004, customer: 'Alice Brown', amount: 199.00, status: 'Pending', date: '2026-10-08' },
    { id: 1005, customer: 'Charlie Davis', amount: 349.99, status: 'Completed', date: '2026-10-08' }
  ],
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
    orders: [12, 19, 15, 21, 18, 24, 22]
  }
});

// GET Dashboard Home
router.get('/', (req, res) => {
  const stats = getDashboardStats();
  res.render('dashboard', {
    pageTitle: 'Dashboard',
    user: req.user,
    stats
  });
});

// GET Users Management
router.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', joined: '2026-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joined: '2026-02-20' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Admin', status: 'Active', joined: '2026-03-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Inactive', joined: '2026-04-05' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', status: 'Active', joined: '2026-05-12' }
  ];
  
  res.render('users', {
    pageTitle: 'User Management',
    user: req.user,
    users
  });
});

// GET Settings
router.get('/settings', (req, res) => {
  res.render('settings', {
    pageTitle: 'Settings',
    user: req.user
  });
});

// GET Profile
router.get('/profile', (req, res) => {
  res.render('profile', {
    pageTitle: 'Profile',
    user: req.user
  });
});

module.exports = router;