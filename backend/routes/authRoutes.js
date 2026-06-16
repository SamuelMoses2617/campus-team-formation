console.log("authRoutes loaded");

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { register, login, forgotPassword, resetPassword } = require("../controllers/authController");
const passport = require("../config/passport");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

if (process.env.GOOGLE_CLIENT_ID) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login.html?error=google_auth_failed" }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user.id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.redirect(`/login.html?token=${token}&role=${req.user.role}&name=${encodeURIComponent(req.user.name)}&id=${req.user.id}&email=${encodeURIComponent(req.user.email)}`);
    }
  );
} else {
  router.get("/google", (req, res) => {
    res.redirect("/login.html?error=google_not_configured");
  });
  router.get("/google/callback", (req, res) => {
    res.redirect("/login.html?error=google_not_configured");
  });
}

router.get("/test", (req, res) => {
    res.send("AUTH ROUTE WORKING");
});

module.exports = router;
