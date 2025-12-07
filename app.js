import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";

// Import database pool and queries
import pool from "./db/pool.js";
import * as queries from "./db/queries.js";
import { checkDatabase, initDatabase } from "./db/init.js";

// Import routes
import authRoutes from "./routes/auth.js";
import membershipRoutes from "./routes/membership.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import * as controller from "./controllers/controller.js";

// Load environment variables
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Session configuration with PostgreSQL store
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "sessions",
    }),
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(express.urlencoded({ extended: false }));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Use email as username
    async (email, password, done) => {
      try {
        const user = await queries.findUserByEmail(email);

        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await queries.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.get("/", controller.getHome);
app.use("/", authRoutes);
app.use("/", membershipRoutes);
app.use("/messages", messageRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

// Initialize database and start server
const startServer = async () => {
  try {
    // Check if database exists, initialize if needed
    const dbExists = await checkDatabase();
    if (!dbExists) {
      console.log("🔄 Database not found, initializing...");
      await initDatabase();
    } else {
      console.log("✅ Database connection verified");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
