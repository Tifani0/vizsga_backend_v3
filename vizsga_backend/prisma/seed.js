const { PrismaClient, Role, Profession } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
  const adminpass = await bcrypt.hash("Admin1234!", 10)
  const pass1 = await bcrypt.hash("Passw123", 10)
const pass2 = await bcrypt.hash("Passw1234", 10)
const pass3 = await bcrypt.hash("Passw12345", 10)
  // Admin felhasználó
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookbeauty.hu" },
    update: {password: adminpass},
    create: {
      name: "Admin",
      email: "admin@bookbeauty.hu",
      password: adminpass,
      phonenumber: "06701234000",
      role: Role.ADMIN,
    }
  })

  const u1 = await prisma.user.upsert({
    where: { email: "nagy.annamari@gmail.com" },
    update: { password: pass1 },
    create: {
      name: "Nagy Annamária",
      email: "nagy.annamari@gmail.com",
      password: pass1,
      phonenumber: "06301234567",
      role: Role.PROVIDER,
      profession: Profession.Műkörmös,
    }
  })

  const u2 = await prisma.user.upsert({
    where: { email: "kiss.berni@gmail.com" },
    update: { password: pass2 },
    create: {
      name: "Kiss Bernadett",
      email: "kiss.berni@gmail.com",
      phonenumber: "06301234568",
      password: pass2,
      role: Role.PROVIDER,
      profession: Profession.Kozmetikus,
    }
  })

  const u3 = await prisma.user.upsert({
    where: { email: "feher.zoltan@gmail.com" },
    update: { password: pass3 },
    create: {
      name: "Fehér Zoltán",
      email: "feher.zoltan@gmail.com",
      phonenumber: "06301234569",
      password: pass3,
      role: Role.PROVIDER,
      profession: Profession.Fodrász,
    }
  })

  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { name: "Műköröm építés", userId: u1.id, description: "Gyönyörű és tartós körmök géllel vagy zselével.", duration: 90, price: 7000 },
      { name: "Körömlakkozás", userId: u1.id, description: "Tartós géllakk applikáció.", duration: 45, price: 3500 },
      { name: "Hajvágás", userId: u3.id, description: "Friss és stílusos hajvágás minden hosszra.", duration: 40, price: 5000 },
      { name: "Teljes hajfestés", userId: u3.id, description: "Teljes hajfestés prémium festékkel.", duration: 120, price: 10000 },
      { name: "Balayage", userId: u3.id, description: "Természetes hatású árnyalatok.", duration: 150, price: 18000 },
      { name: "Teljes arckezelés", userId: u2.id, description: "Mélylelő arctisztítás hidratálással.", duration: 60, price: 8000 },
      { name: "Szemöldökalakítás", userId: u2.id, description: "Precíz formázás és szálazás.", duration: 20, price: 2500 },
    ]
  })

  console.log("Seed kész! Admin: admin@bookbeauty.hu / Admin1234!")
  console.log("Szolgáltatói kód: BookBeauty2025!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
