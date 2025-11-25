// middleware/authGuard.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";

export default function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // FIRST: Try to verify as ACCESS TOKEN (most common)
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;        // or req.userId = decoded.id
    req.tokenType = "access";
    return next();
  } catch (err) {
    // If access token failed → try as REFRESH TOKEN
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET);
      req.user = decoded;
      req.tokenType = "refresh";
      return next();   // You can allow refresh token here OR block it (see below)
    } catch (refreshErr) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}