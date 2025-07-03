import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Check if any users exist
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      // Create initial admin user
      const adminPassword = await bcrypt.hash("admin123", 12);
      await prisma.user.create({
        data: {
          email: "admin@beautyexpress.com",
          name: "Beauty Express Admin",
          password: adminPassword,
          role: "ADMIN",
        },
      });

      // Create stylist
      const stylistPassword = await bcrypt.hash("stylist123", 12);
      await prisma.user.create({
        data: {
          email: "sarah@beautyexpress.com",
          name: "Sarah Johnson",
          password: stylistPassword,
          role: "STYLIST",
        },
      });

      // Create client
      const clientPassword = await bcrypt.hash("client123", 12);
      await prisma.user.create({
        data: {
          email: "client@example.com",
          name: "Jane Doe",
          password: clientPassword,
          phone: "555-0123",
          role: "CLIENT",
        },
      });

      // Create some services
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
      ];

      for (const service of services) {
        await prisma.service.create({
          data: service,
        });
      }
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });

    const services = await prisma.service.findMany();

    return NextResponse.json({
      status: "Database connected successfully",
      userCount: users.length,
      users,
      services: services.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Database connection failed", details: error },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
