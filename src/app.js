import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import habitRoutes from "./routes/habit.route.js";
import authGuard from "./middleware/authGuard.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/habit", authGuard, habitRoutes)

export default app;
