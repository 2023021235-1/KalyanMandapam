// index.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const app = express();

// ─── 1) CONNECT TO MONGODB ──────────────────────────────────────
mongoose
  .connect(process.env.URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── 2) TRUST PROXY (CRUCIAL ON RENDER) ─────────────────────────
// Render terminates TLS at its load balancer, so internal Express sees HTTP.
// By doing this, Express knows to trust the 'X-Forwarded-Proto' header and treat the request as HTTPS.
app.set("trust proxy", 1);

// ─── 3) CORS MIDDLEWARE ─────────────────────────────────────────
// Replace with your actual Vercel frontend URL.
const FRONTEND_URL = process.env.FRONTEND_URL || "https://kalyan-mandapam.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,  // ← VERY IMPORTANT: allow browser to send and receive cookies
  })
);

app.use(express.json());

// ─── 4) SESSION MIDDLEWARE ───────────────────────────────────────
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
      secure: true,       // ← must be true on HTTPS
      sameSite: "none",   // ← must be "none" for cross-site cookies
      maxAge: 1000 * 60 * 10, // 10 minutes
    },
  })
);

// ─── 5) ROUTES ───────────────────────────────────────────────────
// Make sure this is *after* session middleware!
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/halls", require("./routes/hallRoutes"));
app.use("/api/bookings", require("./routes/bookRoutes"));
app.use("/api/otp", require("./routes/otpRoutes"));

app.get("/health-check-polling", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
