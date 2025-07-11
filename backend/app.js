// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

// Import packages
import express from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

// Initialize Express app
const app = express();

// Middleware: JSON body parser
app.use(express.json());

// Middleware: File upload handler
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/"
}));


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI;
mongoose.connect(DB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Routes
// course route
import courseRoute from "./routes/course.route.js";
app.use("/api/v1/course", courseRoute);


// user routes 
import userRoute from "./routes/user.route.js";
app.use("/api/v1/user", userRoute);


// Admin route 
import adminRouter from "./routes/admin.route.js";
app.use("/api/v1/admin", adminRouter);


// Order route
import orderRoute from "./routes/order.route.js";
app.use("/api/v1/order", orderRoute);

// Default route
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Start server
export default app;