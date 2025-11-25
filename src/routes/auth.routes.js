import express from "express";
import { 
    register, 
    login, 
    forgotPassword, 
    verifyOTP, 
    resetPassword 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/verify", verifyOTP);
router.post("/reset", resetPassword);

export default router;