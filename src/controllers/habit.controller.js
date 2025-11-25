import habitModel from "../models/habit.model.js";

export const createHabit = async (req, res) => {
    try {
 const { title, category, frequency, goal, aiGenerated } = req.body;
        const userId = req.user.id;

        const habit = await habitModel.create({
            user: userId,
            title,
            category,
            frequency,
            goal: goal || "",
            aiGenerated: aiGenerated || false,
            streak: 0,
            isAchieved: false,
        });

        res.status(201).json({
            message: "Habit created successfully",
            habit,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


export const getMyHabits = async (req, res) => {
    try {
        const userId = req.user.id;

        const habits = await habitModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.json({
            habits,
            count: habits.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getHabitById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const habit = await habitModel.findOne({ _id: id, user: userId });

        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        res.json({ habit });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Invalid habit ID" });
        }
        res.status(500).json({ message: "Server error" });
    }
};

export const completeHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const habit = await habitModel.findOne({ _id: id, user: userId });
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last = habit.lastCompletedDate
            ? new Date(habit.lastCompletedDate)
            : null;
        last?.setHours(0, 0, 0, 0);

        let newStreak = habit.streak;

        if (!last || last < today) {
            // First time or new day
            if (last && last.getTime() === today.getTime() - 86400000) {
                newStreak = habit.streak + 1; // yesterday → continue streak
            } else {
                newStreak = 1; // reset or start
            }
        }

        habit.streak = newStreak;
        habit.lastCompletedDate = today;
        habit.isAchieved = true;

        // Add to history
        habit.completionHistory.push({ date: today });

        await habit.save();

        res.json({
            message: "Great job! Habit completed",
            habit,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};