"use client";

import { useEffect } from "react";
import { collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useSampleData() {
  useEffect(() => {
    const initializeSampleData = async () => {
      try {
        // Add sample bookings for today
        const today = new Date().toISOString().split("T")[0];

        const sampleBookings = [
          {
            customerName: "Sarah Johnson",
            customerEmail: "sarah@example.com",
            customerPhone: "+1234567890",
            service: "Gel Manicure",
            stylist: "Stylist 1",
            date: today,
            time: "10:00 AM",
            status: "confirmed",
            notes: "Regular customer",
            createdAt: Timestamp.now(),
            revenue: 450,
          },
          {
            customerName: "Maria Garcia",
            customerEmail: "maria@example.com",
            customerPhone: "+1234567891",
            service: "Pedicure",
            stylist: "Stylist 2",
            date: today,
            time: "2:00 PM",
            status: "pending",
            notes: "First time client",
            createdAt: Timestamp.now(),
            revenue: 350,
          },
          {
            customerName: "Lisa Chen",
            customerEmail: "lisa@example.com",
            customerPhone: "+1234567892",
            service: "Nail Art",
            stylist: "Stylist 1",
            date: today,
            time: "4:00 PM",
            status: "confirmed",
            notes: "Special design requested",
            createdAt: Timestamp.now(),
            revenue: 600,
          },
        ];

        // Add sample clients
        const sampleClients = [
          {
            uid: "client1",
            email: "sarah@example.com",
            displayName: "Sarah Johnson",
            phone: "+1234567890",
            createdAt: new Date(),
            isClient: true,
          },
          {
            uid: "client2",
            email: "maria@example.com",
            displayName: "Maria Garcia",
            phone: "+1234567891",
            createdAt: new Date(),
            isClient: true,
          },
          {
            uid: "client3",
            email: "lisa@example.com",
            displayName: "Lisa Chen",
            phone: "+1234567892",
            createdAt: new Date(),
            isClient: true,
          },
        ];

        // Add sample conversations
        const sampleConversations = [
          {
            id: "client1_admin",
            customerName: "Sarah Johnson",
            customerEmail: "sarah@example.com",
            customerId: "client1",
            lastMessage: "Thank you for confirming my appointment!",
            lastMessageTime: Timestamp.now(),
            unreadCount: 1,
          },
          {
            id: "client2_admin",
            customerName: "Maria Garcia",
            customerEmail: "maria@example.com",
            customerId: "client2",
            lastMessage: "What time slots do you have available?",
            lastMessageTime: Timestamp.now(),
            unreadCount: 2,
          },
        ];

        // Add sample messages
        const sampleMessages = [
          {
            text: "Hi! I'd like to book an appointment",
            senderId: "client1",
            senderName: "Sarah Johnson",
            senderType: "customer",
            conversationId: "client1_admin",
            timestamp: Timestamp.now(),
          },
          {
            text: "Of course! What service are you interested in?",
            senderId: "VJdxemjpYTfR3TAfAQDmZ9ucjxB2",
            senderName: "Admin",
            senderType: "admin",
            conversationId: "client1_admin",
            timestamp: Timestamp.now(),
          },
          {
            text: "Thank you for confirming my appointment!",
            senderId: "client1",
            senderName: "Sarah Johnson",
            senderType: "customer",
            conversationId: "client1_admin",
            timestamp: Timestamp.now(),
          },
        ];

        // Initialize data (only run once - use localStorage to track)
        const sampleDataInitialized = localStorage.getItem(
          "sampleDataInitialized",
        );

        if (!sampleDataInitialized) {
          // Add bookings
          for (const booking of sampleBookings) {
            await addDoc(collection(db, "bookings"), booking);
          }

          // Add clients
          for (const client of sampleClients) {
            await setDoc(doc(db, "clients", client.uid), client);
          }

          // Add conversations
          for (const conversation of sampleConversations) {
            await setDoc(
              doc(db, "conversations", conversation.id),
              conversation,
            );
          }

          // Add messages
          for (const message of sampleMessages) {
            await addDoc(collection(db, "messages"), message);
          }

          localStorage.setItem("sampleDataInitialized", "true");
          console.log("Sample data initialized");
        }
      } catch (error) {
        console.error("Error initializing sample data:", error);
      }
    };

    // Run once on mount
    const timer = setTimeout(initializeSampleData, 1000);
    return () => clearTimeout(timer);
  }, []);
}
