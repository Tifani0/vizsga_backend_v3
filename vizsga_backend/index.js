const { PrismaClient, Role, Profession } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const app = express();
const cors = require("cors");

// ─── CORS – kézi header beállítás, minden metódusra ─────────────────────────
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204);
//   }
//   next();
// });
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// ─── Titkos kód a szolgáltatói regisztrációhoz ───────────────────────────────
const PROVIDER_SECRET = "BookBeauty2025!";

// ─── FELHASZNÁLÓK ────────────────────────────────────────────────────────────

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  res.json(user);
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, phonenumber, password, role, profession, providerCode } = req.body;
    let assignedRole = "CUSTOMER";
    let assignedProfession = null;
    if (role === "PROVIDER") {
      if (providerCode !== PROVIDER_SECRET) return res.status(403).json({ error: "Érvénytelen szolgáltatói kód!" });
      if (!profession) return res.status(400).json({ error: "Szakma megadása kötelező szolgáltatóknál!" });
      assignedRole = "PROVIDER";
      assignedProfession = profession;
    }
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return res.status(409).json({ error: "Ez az email cím már használatban van!" });
    const user = await prisma.user.create({
      data: { name, email, phonenumber, password, role: assignedRole, profession: assignedProfession },
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: "Felhasználó nem található!" });
    if (target.role === "ADMIN") return res.status(403).json({ error: "Admin felhasználó nem törölhető!" });
    await prisma.appointment.deleteMany({ where: { OR: [{ customerId: id }, { providerId: id }] } });
    await prisma.availableSlot.deleteMany({ where: { providerId: id } });
    await prisma.service.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── SZOLGÁLTATÓK ────────────────────────────────────────────────────────────

app.get("/providers", async (req, res) => {
  const providers = await prisma.user.findMany({ where: { role: Role.PROVIDER }, include: { services: true } });
  res.json(providers);
});

app.get("/hairdressers", async (req, res) => {
  const data = await prisma.user.findMany({ where: { role: Role.PROVIDER, profession: Profession.Fodrász }, include: { services: true } });
  res.json(data);
});

app.get("/nailbuilders", async (req, res) => {
  const data = await prisma.user.findMany({ where: { role: Role.PROVIDER, profession: Profession.Műkörmös }, include: { services: true } });
  res.json(data);
});

app.get("/beauticians", async (req, res) => {
  const data = await prisma.user.findMany({ where: { role: Role.PROVIDER, profession: Profession.Kozmetikus }, include: { services: true } });
  res.json(data);
});

// ─── SZOLGÁLTATÁSOK ──────────────────────────────────────────────────────────

app.get("/services", async (req, res) => {
  const { userId } = req.query;
  const where = userId ? { userId: Number(userId) } : {};
  const services = await prisma.service.findMany({
    where,
    include: { user: { select: { id: true, name: true, profession: true } } },
  });
  res.json(services);
});

app.post("/services", async (req, res) => {
  try {
    const { name, description, duration, price, userId } = req.body;
    if (!name || !duration || !price || !userId) return res.status(400).json({ error: "Név, időtartam, ár és userId kötelező!" });
    const service = await prisma.service.create({
      data: { name, description: description || "", duration: Number(duration), price: Number(price), userId: Number(userId) },
    });
    res.json(service);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/services/:id", async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (duration !== undefined) data.duration = Number(duration);
    if (price !== undefined) data.price = Number(price);
    const service = await prisma.service.update({ where: { id: Number(req.params.id) }, data });
    res.json(service);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/services/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.appointment.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── SZABAD IDŐPONTOK ────────────────────────────────────────────────────────

app.get("/availableSlots", async (req, res) => {
  const { providerId, date } = req.query;
  const where = {};
  if (providerId) where.providerId = Number(providerId);
  if (date) where.date = date;
  const slots = await prisma.availableSlot.findMany({ where, orderBy: [{ date: "asc" }, { time: "asc" }] });
  res.json(slots);
});

app.post("/availableSlots", async (req, res) => {
  try {
    const { providerId, date, time } = req.body;
    const slot = await prisma.availableSlot.create({ data: { providerId: Number(providerId), date, time } });
    res.json(slot);
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Ez az időpont már meghirdetve!" });
    res.status(500).json({ error: e.message });
  }
});

app.delete("/availableSlots/:id", async (req, res) => {
  try {
    await prisma.availableSlot.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── FOGLALÁSOK ──────────────────────────────────────────────────────────────

app.get("/appointments/all", async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true, phonenumber: true } },
      provider: { select: { id: true, name: true, profession: true } },
      service: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  res.json(appointments);
});

app.get("/appointments", async (req, res) => {
  const { customerId, providerId, date, status } = req.query;
  const where = {};
  if (customerId) where.customerId = Number(customerId);
  if (providerId) where.providerId = Number(providerId);
  if (date) where.date = date;
  if (status) where.status = status;
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phonenumber: true } },
      provider: { select: { id: true, name: true, profession: true } },
      service: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  res.json(appointments);
});

app.post("/appointments", async (req, res) => {
  try {
    const { customerId, providerId, serviceId, date, time, note } = req.body;
    const existing = await prisma.appointment.findFirst({
      where: { providerId: Number(providerId), date, time, status: { not: "cancelled" } },
    });
    if (existing) return res.status(409).json({ error: "Ez az időpont már foglalt!" });
    const appointment = await prisma.appointment.create({
      data: {
        customerId: Number(customerId),
        providerId: Number(providerId),
        serviceId: Number(serviceId),
        date, time,
        note: note || null,
        status: "confirmed",
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, profession: true } },
        service: true,
      },
    });
    res.json(appointment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/appointments/:id", async (req, res) => {
  try {
    const { status, note } = req.body;
    console.log(status);
    
    const data = {};
    if (status) data.status = status;
    if (note !== undefined) data.note = note;
    const updated = await prisma.appointment.update({
      where: { id: Number(req.params.id) },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, profession: true } },
        service: true,
      },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/appointments/:id", async (req, res) => {
  try {
    await prisma.appointment.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(3000, () => console.log("Fut a szerver: http://localhost:3000"));