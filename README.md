# Members Only Club — Exclusive Community Platform

An elegant members-only social platform built with Express, EJS, Tailwind CSS, and PostgreSQL. Features a modern dark theme with glassmorphism effects, three-tier permission system, and secure authentication for private community discussions.

## 🌐 Live Demo

**[https://members-only-7ta6.onrender.com/](https://members-only-7ta6.onrender.com/)**

## Tech Stack

- **Backend**: Node.js + Express
- **Authentication**: Passport.js (Local Strategy) + bcryptjs
- **Database**: PostgreSQL + pg
- **Session Store**: connect-pg-simple (PostgreSQL-backed sessions)
- **Templating**: EJS (Server-side rendering)
- **Styling**: Tailwind CSS (via CDN) with custom dark theme
- **Validation**: express-validator
- **Environment**: dotenv

## Features

### Three-Tier Permission System

- **Guests**: Can view messages but not see authors or timestamps
- **Members**: Unlock full access to see message authors and timestamps
- **Admins**: Full moderation capabilities including message deletion

### Core Functionality

- User registration and authentication
- Secure password hashing with bcryptjs
- Secret passcode system for membership upgrades
- Message board with conditional content display
- User profiles with message history and stats
- Admin dashboard with user management and moderation tools
- Form validation and sanitization
- PostgreSQL-backed session management

### Modern UI/UX

- Dark theme with glassmorphism navbar effects
- Glow effects on interactive elements
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Intuitive navigation with role-based features

## Project Structure

```
app.js                    # Main application entry point
package.json              # Dependencies and scripts
controllers/
  controller.js           # Business logic for all routes
  dbcontroller.js         # Database operations (deprecated)
routes/
  auth.js                 # Authentication routes (signup, login, logout)
  membership.js           # Membership upgrade routes
  messages.js             # Message CRUD operations
  users.js                # User profile routes
  admin.js                # Admin dashboard and moderation
middleware/
  validation.js           # Form validation rules with express-validator
db/
  pool.js                 # PostgreSQL connection pool
  init.js                 # Database initialization and schema creation
  queries.js              # SQL queries for all database operations
views/
  layout.ejs              # Global layout (unused, inline styles per page)
  index.ejs               # Homepage with stats and recent messages
  error.ejs               # Error page
  auth/                   # Authentication views (signup, login)
  membership/             # Membership upgrade view
  messages/               # Message list, detail, and creation views
  users/                  # User profile view
  admin/                  # Admin dashboard
```

## Getting Started

### Prerequisites

- Node.js 18+ (or later)
- PostgreSQL database (local or cloud service like Neon)

### Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Or use individual settings:
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=members_only
DB_PORT=5432

# Session Secret (change in production!)
SESSION_SECRET=your-super-secret-session-key

# Membership Passcode (change to your secret!)
MEMBERSHIP_PASSCODE=your-secret-club-passcode

# Environment
NODE_ENV=production
PORT=3000
```

### Install Dependencies

```bash
npm install
```

### Database Setup

**Automatic Setup**: The app will automatically initialize the database on first run. Tables and schema are created automatically if they don't exist.

**Manual Database Population**: If you want to manually initialize:

```bash
npm run db:populate
```

### Run the App

```bash
npm start
```

Then open http://localhost:3000

For development with live-reload:

```bash
npm run dev
```

## Key Routes

### Public Routes

- **Home**: `/` — Dashboard with community stats and recent messages
- **Sign Up**: `/signup` — Create a new account
- **Log In**: `/login` — Authenticate existing users

### Authenticated Routes

- **Profile**: `/profile` — View your profile and message history
- **Join Club**: `/join-club` — Upgrade to member status with secret passcode
- **Messages**: `/messages` — View all messages
- **Create Message**: `/messages/new` — Post a new message
- **Message Detail**: `/messages/:id` — View single message

### Admin Routes

- **Admin Dashboard**: `/admin` — User management and moderation tools

## Database Schema

### Users Table

- Basic user information (name, email, password)
- Role flags (is_member, is_admin)
- Joined date tracking

### Messages Table

- Message content (title, text)
- Author reference (user_id foreign key)
- Timestamp tracking
- Cascade delete on user removal

### Sessions Table

- PostgreSQL-backed session storage
- Automatic cleanup of expired sessions

## Styling & Design

- **Color Palette**:
  - Background: Deep Slate (#0F172A)
  - Cards: Lighter Slate (#1E293B)
  - Text: Light Grey (#E2E8F0)
  - Accents: Sky Blue (#38BDF8) and Pink (#F472B6)
- **Glassmorphism**: Navbar uses backdrop-filter blur with transparency
- **Glow Effects**: Interactive elements have subtle glow on hover
- **Responsive**: Mobile-first design with Tailwind utilities

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- CSRF protection through session management
- SQL injection prevention with parameterized queries
- XSS protection with express-validator sanitization
- Secure session cookies (httpOnly, secure in production)
- Input validation on all forms

## Deployment

This app is deployment-ready for cloud platforms:

- **Render/Railway/Heroku**: Add PostgreSQL addon and set DATABASE_URL
- **Vercel**: Use with Vercel Postgres or external database
- **Neon**: Cloud PostgreSQL with built-in connection pooling

The app automatically handles database initialization and SSL connections for production environments.

## Scripts

- `npm start` — Start the server (production mode)
- `npm run dev` — Start with watch mode (Node --watch)
- `npm run db:populate` — Manually initialize and seed database
- `npm run db:check` — Check database connection and tables

## Development Notes

### Authentication Flow

1. User registers → Password hashed → Stored in database
2. User logs in → Passport authenticates → Session created
3. Session stored in PostgreSQL → User stays logged in
4. Logout → Session destroyed

### Permission Levels

- **Guest** (default): Can read messages, but authors are hidden
- **Member** (passcode required): Full access to authors and timestamps
- **Admin** (set during signup): All member privileges + moderation tools

### Message Display Logic

- All users see message titles and content
- Only members see author names and timestamps
- Only admins see delete buttons

## License

MIT

---

Built as part of [The Odin Project](https://www.theodinproject.com/) full-stack curriculum.
