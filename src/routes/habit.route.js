import express from "express";
import {
    createHabit,
    getMyHabits,
    getHabitById,
    completeHabit,
} from "../controllers/habit.controller.js";
import authGuard from "../middleware/authGuard.js";

const router = express.Router();

router.use(authGuard); 

router.post("/", createHabit);
router.get("/", getMyHabits);
router.get("/:id", getHabitById);
router.patch("/:id/complete", completeHabit);

export default router;