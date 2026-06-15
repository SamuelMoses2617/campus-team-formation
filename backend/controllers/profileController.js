const prisma = require("../config/prismaClient");

const createProfile = async (req, res) => {
  try {
    const { name, rollno, branch, year, skills, linkedin, github } = req.body;
    const userId = req.user.id;

    const existing = await prisma.studentProfile.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await prisma.studentProfile.create({
      data: { userId, rollno, branch, year, skills, linkedin, github }
    });

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    res.status(201).json({ message: "Profile created", profile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, rollno, branch, year, skills, linkedin, github } = req.body;

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: { rollno, branch, year, skills, linkedin, github }
    });

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    res.json({ message: "Profile updated", profile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createProfile, getProfile, getAllProfiles, updateProfile };
