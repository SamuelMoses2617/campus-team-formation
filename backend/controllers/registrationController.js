const prisma = require("../config/prismaClient");

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user.id;

    const existing = await prisma.registration.findUnique({
      where: { studentId_eventId: { studentId, eventId } }
    });
    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    const registration = await prisma.registration.create({
      data: { studentId, eventId }
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (event && event.facultyId) {
      await prisma.notification.create({
        data: {
          userId: event.facultyId,
          message: `New registration for "${event.title}"`,
          type: "registration",
          relatedId: eventId
        }
      });
    }

    res.status(201).json({ message: "Registered successfully", registration });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await prisma.registration.findMany({
      where: { studentId: userId },
      include: { event: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(registrations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        student: {
          select: { id: true, name: true, email: true, profile: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(registrations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await prisma.registration.update({
      where: { id },
      data: { status }
    });

    res.json({ message: `Registration ${status}`, registration });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerForEvent, getRegistrations, getEventRegistrations, updateRegistrationStatus };
