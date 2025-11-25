// models/Habit.model.js
import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // for fast lookup by user
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "Health",
                "Fitness",
                "Personal Growth",
                "Mindfulness",
                "Productivity",
                "Learning",
                "Social",
                "Finance",
                "Other",
                "General",
                "Work"
            ],
            default: "Other",
        },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            default: "daily",
        },
        goal: {
            type: String,
            default: "",
        },
        aiGenerated: {
            type: Boolean,
            default: false,
        },
        streak: {
            type: Number,
            default: 0,
        },
        isAchieved: {
            type: Boolean,
            default: false,
        },
        lastCompletedDate: {
            type: Date,
            default: null,
        },
        // Optional: track completion history
        completionHistory: [
            {
                date: { type: Date, required: true },
                completed: { type: Boolean, default: true },
            },
        ],
    },
    { timestamps: true }
);

// Compound index for fast queries
habitSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Habit", habitSchema);