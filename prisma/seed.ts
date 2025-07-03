import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@beautyexpress.com" },
    update: {},
    create: {
      email: "admin@beautyexpress.com",
      name: "Beauty Express Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create stylists
  const stylistPassword = await bcrypt.hash("stylist123", 12);
  const sarah = await prisma.user.upsert({
    where: { email: "sarah@beautyexpress.com" },
    update: {},
    create: {
      email: "sarah@beautyexpress.com",
      name: "Sarah Johnson",
      password: stylistPassword,
      role: "STYLIST",
    },
  });

  const emma = await prisma.user.upsert({
    where: { email: "emma@beautyexpress.com" },
    update: {},
    create: {
      email: "emma@beautyexpress.com",
      name: "Emma Davis",
      password: stylistPassword,
      role: "STYLIST",
    },
  });

  const lisa = await prisma.user.upsert({
    where: { email: "lisa@beautyexpress.com" },
    update: {},
    create: {
      email: "lisa@beautyexpress.com",
      name: "Lisa Chen",
      password: stylistPassword,
      role: "STYLIST",
    },
  });

  // Create sample client
  const clientPassword = await bcrypt.hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Jane Doe",
      password: clientPassword,
      phone: "555-0123",
      role: "CLIENT",
    },
  });

  // Create services
  const services = [
    {
      name: "Gel Manicure",
      description: "Long-lasting gel manicure",
      duration: 45,
      price: 35,
    },
    {
      name: "Classic Pedicure",
      description: "Relaxing pedicure treatment",
      duration: 60,
      price: 40,
    },
    {
      name: "Nail Art",
      description: "Custom nail art design",
      duration: 90,
      price: 55,
    },
    {
      name: "Full Set Acrylic",
      description: "Complete acrylic nail set",
      duration: 120,
      price: 65,
    },
    {
      name: "Gel Removal",
      description: "Safe gel polish removal",
      duration: 30,
      price: 15,
    },
    {
      name: "Spa Package",
      description: "Complete spa treatment",
      duration: 150,
      price: 85,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }

  console.log("Database seeded successfully!");
  console.log("Admin login: admin@beautyexpress.com / admin123");
  console.log("Stylist login: sarah@beautyexpress.com / stylist123");
  console.log("Client login: client@example.com / client123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
