const { PrismaClient, Role, Profession } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Admin felhasználó
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookbeauty.hu" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bookbeauty.hu",
      password: "Admin1234!",
      phonenumber: "06701234000",
      role: Role.ADMIN,
    }
  })

  const u1 = await prisma.user.upsert({
    where: { email: "nagy.annamari@gmail.com" },
    update: {},
    create: {
      name: "Nagy Annamária",
      email: "nagy.annamari@gmail.com",
      password: "Passw123",
      phonenumber: "06301234567",
      role: Role.PROVIDER,
      profession: Profession.Műkörmös,
    }
  })

  const u2 = await prisma.user.upsert({
    where: { email: "kiss.berni@gmail.com" },
    update: {},
    create: {
      name: "Kiss Bernadett",
      email: "kiss.berni@gmail.com",
      phonenumber: "06301234568",
      password: "Passw1234",
      role: Role.PROVIDER,
      profession: Profession.Kozmetikus,
    }
  })

  const u3 = await prisma.user.upsert({
    where: { email: "feher.zoltan@gmail.com" },
    update: {},
    create: {
      name: "Fehér Zoltán",
      email: "feher.zoltan@gmail.com",
      phonenumber: "06301234569",
      password: "Passw12345",
      role: Role.PROVIDER,
      profession: Profession.Fodrász,
    }
  })

  // Teszt ügyfél
  await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: {},
    create: {
      name: "Teszt Felhasználó",
      email: "test@gmail.com",
      password: "Password1",
      phonenumber: "06309999999",
      role: Role.CUSTOMER,
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
