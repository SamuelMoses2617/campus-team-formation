const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader); // 👈 ADD THIS

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN RECEIVED:", token); // 👈 KEEP THIS

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT ERROR:", err.message); // 👈 KEEP THIS
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;