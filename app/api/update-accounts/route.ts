import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Find and update existing admin account
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    let admin;
    if (existingAdmin) {
      // Update existing admin
      admin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: "beautyexpress777@gmail.com",
          name: "BeautyExpress Admin",
        },
      });
    } else {
      // Create new admin if none exists
      const adminPassword = await bcrypt.hash("admin123", 12);
      admin = await prisma.user.create({
        data: {
          email: "beautyexpress777@gmail.com",
          name: "BeautyExpress Admin",
          password: adminPassword,
          role: "ADMIN",
        },
      });
    }

    // Find and update existing stylist account
    const existingStylist = await prisma.user.findFirst({
      where: { role: "STYLIST" },
    });

    let stylist;
    if (existingStylist) {
      // Update existing stylist
      stylist = await prisma.user.update({
        where: { id: existingStylist.id },
        data: {
          email: "beautyexpress254@gmail.com",
          name: "BeautyExpress Stylist",
        },
      });
    } else {
      // Create new stylist if none exists
      const stylistPassword = await bcrypt.hash("stylist123", 12);
      stylist = await prisma.user.create({
        data: {
          email: "beautyexpress254@gmail.com",
          name: "BeautyExpress Stylist",
          password: stylistPassword,
          role: "STYLIST",
        },
      });
    }

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
