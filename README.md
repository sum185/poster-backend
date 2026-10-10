# Admin Login & Dashboard (Node.js)

Simple admin authentication system built with Node.js + Express.

## Setup

```bash
npm install
npm start
```

Then open: **http://localhost:3000**

## Default Credentials

| Username | Password |
|----------|----------|
| admin    | admin123 |

## Environment Variables (optional)

```bash
set ADMIN_USERNAME=myadmin
set ADMIN_PASSWORD=secretpass
set SESSION_SECRET=supersecretkey
set PORT=3000
```

## Features

- 🔐 Session-based login with bcrypt password hashing
- 🚪 Protected dashboard (redirects to login if not authenticated)
- 📊 Dashboard with stat cards + recent activity (via protected `/api/stats`)
- 🚪 Logout functionality

## Project Structure

```
poster_backend/
├── server.js            # Express server + auth logic
├── package.json
└── public/
    ├── login.html       # Login page
    └── dashboard.html   # Admin dashboard
```

## API

| Method | Route        | Description                     | Auth  |
|--------|--------------|---------------------------------|-------|
| GET    | `/login`     | Login page                      | No    |
| POST   | `/login`     | Submit credentials              | No    |
| GET    | `/admin`     | Dashboard page                  | Yes   |
| GET    | `/api/stats` | Dashboard data (JSON)           | Yes   |
| POST   | `/logout`    | Logout + destroy session        | Yes   |
