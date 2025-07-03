import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Delete existing stylist accounts
    await prisma.user.deleteMany({
      where: { role: "STYLIST" },
    });

    // Create the single stylist account
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
      stylist: {
        id: stylist.id,
        email: stylist.email,
        name: stylist.name,
        role: stylist.role,
      },
    });
  } catch (error) {
    console.error("Error updating stylist account:", error);
    return NextResponse.json(
      { error: "Failed to update stylist account" },
      { status: 500 },
    );
  }
}
