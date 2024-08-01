import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import verifyJwt from "./middlewares/auth.middleware.js";
import "./utils/passport.js";
import path from "path";

const app = express();
const __dirname = path.resolve();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));

// Routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import notificationRouter from "./routes/notification.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", verifyJwt, userRouter);
app.use("/api/v1/posts", verifyJwt, postRouter);
app.use("/api/v1/notifications", verifyJwt, notificationRouter);

// error handler
import errorHandler from "./middlewares/error.middleware.js";

app.use(errorHandler);

// Serve static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// connect to the database
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error connecting to the database: ${error.message}`);
  });
