const express = require("express");
const router = express.Router();
const { createProfile, getProfile, getAllProfiles, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createProfile);
router.get("/", authMiddleware, getProfile);
router.get("/all", authMiddleware, getAllProfiles);
router.put("/", authMiddleware, updateProfile);

module.exports = router;
