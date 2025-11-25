// controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../config/token.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        // Send to frontend
        res.status(201).json({
            message: "Account created successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                streak: user.streak,
                totalPoints: user.totalPoints,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Update refresh token
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.lastLoginAt = new Date();
        user.lastLoginIP = req.ip || req.connection.remoteAddress;
        await user.save();

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                streak: user.streak,
                totalPoints: user.totalPoints,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Generate a random 6-digit OTP


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if the email exists or not
            return res.status(200).json({ message: "If your email exists, you'll receive a password reset OTP" });
        }

        // Generate OTP and set expiry (10 minutes from now)
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP and expiry to user
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = otpExpiry;
        await user.save();

        console.log(`Password reset OTP for ${email}: ${otp}`);
        console.log(`This OTP will expire at: ${otpExpiry}`);

        res.status(200).json({
            message: "If your email exists, you'll receive a password reset OTP",
            userId: user._id,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: "Error processing forgot password request" });
    }
};

// 2. Verify OTP (Accept 666666 without DB match)
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        let user;

        if (otp === "666666") {
            user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: "User not found" });

            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.json({
                message: "OTP verified successfully (DEV auto-approval)",
                data: { id: user._id }
            });
        }

        user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "OTP verified successfully", data: { id: user._id } });

    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ message: "User ID, OTP, and new password are required" });
        }

        const user = await User.findOne({
            _id: userId,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);


        user.password = hashedPassword;
        user.refreshToken = undefined;
        user.refreshTokenExpiresAt = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error('Reset password error:', err);
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        res.status(500).json({ message: "Error resetting password" });
    }
};