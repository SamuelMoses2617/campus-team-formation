const prisma = require("../config/prismaClient");

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const facultyId = req.user.id;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        facultyId
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating event" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
};

const getFacultyEvents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const events = await prisma.event.findMany({
      where: { facultyId },
      orderBy: { createdAt: "desc" }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event" });
  }
};

module.exports = { createEvent, getEvents, getFacultyEvents, deleteEvent };
