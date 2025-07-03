import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Delete existing admin and stylist accounts
    await prisma.user.deleteMany({
      where: {
        OR: [{ role: "ADMIN" }, { role: "STYLIST" }],
      },
    });

    // Create the new admin account
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.create({
      data: {
        email: "beautyexpress777@gmail.com",
        name: "BeautyExpress Admin",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    // Create the new stylist account
    const stylistPassword = await bcrypt.hash("stylist123", 12);
    const stylist = await prisma.user.create({
      data: {
        email: "beautyexpress254@gmail.com",
        name: "BeautyExpress Stylist",
        password: stylistPassword,
        role: "STYLIST",
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        name: admin.name,
      },
      stylist: {
        email: stylist.email,
        name: stylist.name,
      },
    });
  } catch (error) {
    console.error("Error updating accounts:", error);
    return NextResponse.json(
      { error: "Failed to update accounts" },
      { status: 500 },
    );
  }
}
