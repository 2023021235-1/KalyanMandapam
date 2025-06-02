// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session"); // ← add this
const MongoStore = require("connect-mongo"); // (optional, if you want to store sessions in MongoDB)

dotenv.config();
const app = express();

// Enable CORS and parse JSON
app.use(cors({
  origin: "https://kalyan-mandapam.vercel.app/",
  credentials: true
}));
app.use(express.json());

// ─── SESSION MIDDLEWARE ─────────────────────────────────────────
// (Option A) In-memory (not recommended for production):
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "keyboard_cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, maxAge: 1000 * 60 * 10 } // 10 minutes
//   })
// );

// (Option B) Store sessions in MongoDB (recommended for a real app)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard_cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.URI,
      collectionName: "sessions"
    }),
    cookie: { secure: false, maxAge: 1000 * 60 * 10 } // 10 minutes
  })
);

// ─── MONGOOSE SETUP ─────────────────────────────────────────────
mongoose
  .connect(process.env.URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── ROUTES ─────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/halls", require("./routes/hallRoutes"));
app.use("/api/bookings", require("./routes/bookRoutes"));
app.use("/api/otp", require("./routes/otpRoutes"));

app.get("/health-check-polling", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
