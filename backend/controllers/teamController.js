const prisma = require("../config/prismaClient");

const createTeam = async (req, res) => {
  try {
    const { eventId, name, members } = req.body;

    const team = await prisma.team.create({
      data: {
        eventId,
        name,
        method: "manual",
        members: {
          create: members.map(m => ({
            studentId: m.studentId,
            role: m.role || null
          }))
        }
      },
      include: { members: true }
    });

    for (const m of members) {
      await prisma.notification.create({
        data: {
          userId: m.studentId,
          message: `You've been added to team "${name}"`,
          type: "team",
          relatedId: eventId
        }
      });
    }

    res.status(201).json({ message: "Team created", team });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        },
        event: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(teams);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getEventTeams = async (req, res) => {
  try {
    const { eventId } = req.params;
    const teams = await prisma.team.findMany({
      where: { eventId },
      include: {
        members: {
          include: {
            student: {
              select: { id: true, name: true, email: true, profile: true }
            }
          }
        }
      }
    });
    res.json(teams);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const SKILL_ROLES = ["frontend", "ui/ux", "ai developer", "web developer", "backend", "ml engineer", "full stack", "devops"];

function categorizeSkill(skill) {
  const s = skill.toLowerCase();
  if (s.includes("react") || s.includes("angular") || s.includes("vue") || s.includes("html") || s.includes("css") || s.includes("javascript") || s.includes("typescript") || s.includes("frontend")) return "frontend";
  if (s.includes("ui") || s.includes("ux") || s.includes("figma") || s.includes("design") || s.includes("photoshop") || s.includes("ui/ux")) return "ui/ux";
  if (s.includes("ai") || s.includes("machine learning") || s.includes("ml") || s.includes("deep learning") || s.includes("tensorflow") || s.includes("pytorch") || s.includes("nlp")) return "ai developer";
  if (s.includes("web") || s.includes("node") || s.includes("express") || s.includes("django") || s.includes("flask") || s.includes("web developer")) return "web developer";
  if (s.includes("backend") || s.includes("api") || s.includes("spring") || s.includes("php") || s.includes("ruby") || s.includes("go")) return "backend";
  if (s.includes("ml") || s.includes("data") || s.includes("python") || s.includes("analytics") || s.includes("sql")) return "ml engineer";
  if (s.includes("fullstack") || s.includes("full stack") || s.includes("mern") || s.includes("mean")) return "full stack";
  if (s.includes("devops") || s.includes("docker") || s.includes("kubernetes") || s.includes("aws") || s.includes("cloud") || s.includes("ci/cd")) return "devops";
  return "web developer";
}

const formAITeams = async (req, res) => {
  try {
    const { eventId, teamSize = 4 } = req.body;

    const registrations = await prisma.registration.findMany({
      where: { eventId, status: "approved" },
      include: {
        student: { include: { profile: true } }
      }
    });

    if (registrations.length === 0) {
      return res.status(400).json({ message: "No approved registrations" });
    }

    const students = registrations.map(r => ({
      id: r.student.id,
      name: r.student.name,
      skills: r.student.profile ? r.student.profile.skills.split(",").map(s => s.trim()) : [],
      rollno: r.student.profile?.rollno || ""
    }));

    const categorized = students.map(s => ({
      ...s,
      primaryRole: s.skills.length > 0 ? categorizeSkill(s.skills[0]) : "web developer",
      allRoles: s.skills.map(categorizeSkill)
    }));

    const roles = ["frontend", "ui/ux", "ai developer", "web developer", "backend", "ml engineer", "full stack", "devops"];
    const roleBuckets = {};
    roles.forEach(r => roleBuckets[r] = []);

    categorized.forEach(s => {
      const assigned = s.allRoles.length > 0 ? s.allRoles[0] : "web developer";
      roleBuckets[assigned].push(s);
    });

    const teams = [];
    let used = new Set();

    while (used.size < categorized.length) {
      const team = { members: [], roles: [] };
      const preferred = ["frontend", "ui/ux", "ai developer", "web developer"];

      for (const role of preferred) {
        const available = roleBuckets[role].filter(s => !used.has(s.id));
        if (available.length > 0) {
          team.members.push(available[0]);
          team.roles.push(role);
          used.add(available[0].id);
        }
      }

      for (const role of roles) {
        if (team.members.length >= teamSize) break;
        const available = roleBuckets[role].filter(s => !used.has(s.id));
        if (available.length > 0) {
          team.members.push(available[0]);
          team.roles.push(role);
          used.add(available[0].id);
        }
      }

      if (team.members.length === 0) break;
      teams.push(team);
    }

    const createdTeams = [];

    for (let i = 0; i < teams.length; i++) {
      const teamName = `Team ${String.fromCharCode(65 + i)}`;
      const team = await prisma.team.create({
        data: {
          eventId,
          name: teamName,
          method: "ai",
          members: {
            create: teams[i].members.map((m, idx) => ({
              studentId: m.id,
              role: teams[i].roles[idx] || "member"
            }))
          }
        },
        include: { members: true }
      });

      for (const m of teams[i].members) {
        await prisma.notification.create({
          data: {
            userId: m.id,
            message: `You've been added to ${teamName} (AI-formed)`,
            type: "team",
            relatedId: eventId
          }
        });
      }

      createdTeams.push(team);
    }

    res.status(201).json({ message: `${createdTeams.length} teams formed`, teams: createdTeams });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadTeamFile = async (req, res) => {
  try {
    const { eventId, teams: teamsData } = req.body;

    const createdTeams = [];

    for (let i = 0; i < teamsData.length; i++) {
      const td = teamsData[i];
      const team = await prisma.team.create({
        data: {
          eventId,
          name: td.name || `Team ${String.fromCharCode(65 + i)}`,
          method: "manual",
          members: {
            create: td.members.map(m => ({
              studentId: m.studentId,
              role: m.role || null
            }))
          }
        },
        include: { members: true }
      });

      for (const m of td.members) {
        await prisma.notification.create({
          data: {
            userId: m.studentId,
            message: `You've been added to "${team.name}"`,
            type: "team",
            relatedId: eventId
          }
        });
      }

      createdTeams.push(team);
    }

    res.status(201).json({ message: `${createdTeams.length} teams created from file`, teams: createdTeams });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createTeam, getTeams, getEventTeams, formAITeams, uploadTeamFile };
