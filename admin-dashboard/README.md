# Admin Dashboard with Express.js, JWT & EJS

A complete admin authentication system with login page, dashboard, and user management built with Node.js, Express.js, JWT authentication, and EJS templates.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication with HTTP-only cookies
- 🎨 **Modern UI** - Clean, responsive dashboard with Bootstrap 5
- 📊 **Dashboard** - Stats cards, charts (Chart.js), recent orders table
- 👥 **User Management** - Search, filter, pagination, add/edit modals
- ⚙️ **Settings Page** - General, email, appearance settings
- 👤 **Profile Page** - Account info, password change, 2FA, sessions
- 🛡️ **Security** - Bcrypt password hashing, input validation, XSS protection
- 📱 **Responsive** - Mobile-first design with collapsible sidebar

## Tech Stack

- **Backend**: Express.js 5.x
- **Template Engine**: EJS
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Frontend**: Bootstrap 5.3, Chart.js, Bootstrap Icons
- **Development**: Nodemon

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### Access the Application

Open your browser and go to: **http://localhost:3000**

### Demo Credentials

| Field | Value |
|-------|-------|
| Email | admin@example.com |
| Password | admin123 |

## Project Structure

```
admin-dashboard/
├── .env                    # Environment variables
├── server.js               # Main entry point
├── package.json
├── middleware/
│   └── auth.js             # JWT verification & token generation
├── routes/
│   ├── auth.js             # Login, logout routes
│   └── dashboard.js        # Dashboard, users, settings, profile routes
├── views/
│   ├── layout.ejs          # Main layout with sidebar & navbar
│   ├── login.ejs           # Login page
│   ├── dashboard.ejs       # Dashboard with stats & charts
│   ├── users.ejs           # User management
│   ├── settings.ejs        # Settings page
│   ├── profile.ejs         # Profile page
│   ├── 404.ejs             # Not found page
│   └── 500.ejs             # Server error page
├── public/
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/
│       └── main.js         # Client-side JavaScript
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Routes

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/login` | Show login page |
| POST | `/auth/login` | Process login |
| GET | `/auth/logout` | Logout user |

### Dashboard (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Main dashboard |
| GET | `/dashboard/users` | User management |
| GET | `/dashboard/settings` | Settings page |
| GET | `/dashboard/profile` | Profile page |

## Customization

### Adding New Pages

1. Create route in `routes/dashboard.js`
2. Create EJS template in `views/`
3. Add navigation link in `views/layout.ejs`

### Changing Admin Credentials

Update `.env` file and generate new password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-new-password', 10))"
```

Then update `ADMIN_PASSWORD_HASH` in `routes/auth.js`.

### Database Integration

Replace hardcoded credentials in `routes/auth.js` with database queries:

```javascript
// Example with MongoDB/Mongoose
const User = require('../models/User');

const user = await User.findOne({ email });
if (!user) return res.render('login', { error: 'Invalid credentials' });

const isMatch = await bcrypt.compare(password, user.password);
```

## Security Considerations

- ✅ HTTP-only cookies for JWT storage
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Input validation with express-validator
- ✅ Environment variables for secrets
- ✅ Helmet.js recommended for production
- ✅ Rate limiting recommended for login endpoint
- ✅ HTTPS required in production

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable `secure: true` for cookies
4. Use reverse proxy (Nginx)
5. Enable HTTPS
6. Add rate limiting
7. Use process manager (PM2)

```bash
npm install -g pm2
pm2 start server.js --name admin-dashboard
```

## License

ISC License - Feel free to use for personal or commercial projects.

## Support

For issues or questions, please create an issue in the repository.