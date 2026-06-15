const prisma = require("../config/prismaClient");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json({ message: "Marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ message: "All marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createNotification = async (req, res) => {
  try {
    const { userId, message, type, relatedId } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, message, type, relatedId }
    });
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
