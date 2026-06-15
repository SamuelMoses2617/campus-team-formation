const express = require("express");
const router = express.Router();
const { createTeam, getTeams, getEventTeams, formAITeams, uploadTeamFile } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);
router.get("/", authMiddleware, getTeams);
router.get("/:eventId", authMiddleware, getEventTeams);
router.post("/ai-form", authMiddleware, formAITeams);
router.post("/upload", authMiddleware, uploadTeamFile);

module.exports = router;
