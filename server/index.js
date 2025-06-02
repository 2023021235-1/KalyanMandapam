// index.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();

// ─── MONGOOSE SETUP ─────────────────────────────────────────────
mongoose
  .connect(process.env.URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── TRUST PROXY (CRUCIAL ON RENDER) ─────────────────────────────
app.set("trust proxy", 1);

// ─── CORS MIDDLEWARE ────────────────────────────────────────────
// Use your actual Render URL for the frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "https://kalyan-mandapam.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,   // allow session cookies
  })
);

app.use(express.json());

// ─── SESSION MIDDLEWARE ──────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard_cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: true,         // must be true on HTTPS
      sameSite: "none",     // must be "none" for cross-site (frontend ↔ backend)
      maxAge: 1000 * 60 * 10 // 10 minutes
    },
  })
);

// ─── ROUTES ──────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/halls", require("./routes/hallRoutes"));
app.use("/api/bookings", require("./routes/bookRoutes"));
app.use("/api/otp", require("./routes/otpRoutes"));

app.get("/health-check-polling", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
