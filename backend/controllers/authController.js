const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: role || "student",
  },
});
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// LOGIN  ← PASTE HERE
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google sign-in. Please click 'Sign in with Google'.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.otp.create({ data: { email, otp } });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Campus Events" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<div style="font-family:sans-serif;padding:20px;background:#f4f4f4"><div style="max-width:400px;margin:auto;background:white;border-radius:12px;padding:30px;text-align:center"><h2 style="color:#333">Password Reset</h2><p style="color:#666">Your OTP to reset your password:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#667eea;margin:20px 0">${otp}</div><p style="color:#999;font-size:12px">Valid for 10 minutes</p></div></div>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields required" });

    const recent = await prisma.otp.findFirst({
      where: { email, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!recent) return res.status(400).json({ message: "Invalid OTP" });

    const elapsed = (Date.now() - new Date(recent.createdAt).getTime()) / 60000;
    if (elapsed > 10) return res.status(400).json({ message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });

    await prisma.otp.deleteMany({ where: { email } });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};