const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createNotification } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getNotifications);
router.put("/:id/read", authMiddleware, markAsRead);
router.put("/read-all", authMiddleware, markAllAsRead);
router.post("/", authMiddleware, createNotification);

module.exports = router;
