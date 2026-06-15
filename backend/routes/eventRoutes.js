const express = require("express");
const router = express.Router();
const { createEvent, getEvents, getFacultyEvents, deleteEvent } = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createEvent);
router.get("/", getEvents);
router.get("/faculty", authMiddleware, getFacultyEvents);
router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;
