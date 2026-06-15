const express = require("express");
const router = express.Router();
const { registerForEvent, getRegistrations, getEventRegistrations, updateRegistrationStatus } = require("../controllers/registrationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, registerForEvent);
router.get("/", authMiddleware, getRegistrations);
router.get("/:eventId", authMiddleware, getEventRegistrations);
router.put("/:id", authMiddleware, updateRegistrationStatus);

module.exports = router;
