import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Get users
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const stylist = await prisma.user.findFirst({ where: { role: "STYLIST" } });
    const client = await prisma.user.findFirst({ where: { role: "CLIENT" } });
    const service = await prisma.service.findFirst();

    if (!admin || !stylist || !client || !service) {
      return NextResponse.json(
        { error: "Required users or services not found" },
        { status: 400 },
      );
    }

    // Create some test bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testBookings = [
      {
        customerId: client.id,
        stylistId: stylist.id,
        serviceId: service.id,
        date: today,
        time: "10:00 AM",
        status: "PENDING",
        price: service.price,
        notes: "First time client",
      },
      {
        customerId: client.id,
        stylistId: stylist.id,
        serviceId: service.id,
        date: today,
        time: "2:00 PM",
        status: "CONFIRMED",
        price: service.price,
        notes: "Regular appointment",
      },
      {
        customerId: client.id,
        stylistId: stylist.id,
        serviceId: service.id,
        date: tomorrow,
        time: "11:00 AM",
        status: "COMPLETED",
        price: service.price,
        notes: "Completed service",
      },
    ];

    for (const booking of testBookings) {
      await prisma.booking.create({
        data: booking,
      });
    }

    // Create some test notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          title: "New Booking Request",
          message: `${client.name} has requested a booking`,
          type: "BOOKING",
        },
        {
          userId: admin.id,
          title: "Service Completed",
          message: `Appointment with ${client.name} has been completed`,
          type: "BOOKING",
        },
        {
          userId: client.id,
          title: "Booking Confirmed",
          message: "Your appointment has been confirmed",
          type: "BOOKING",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: "Failed to create test data" },
      { status: 500 },
    );
  }
}
