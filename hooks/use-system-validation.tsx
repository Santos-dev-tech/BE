"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "sonner";

interface SystemStats {
  todaysBookings: number;
  pendingMessages: number;
  activeCustomers: number;
  revenueToday: number;
  lastUpdate: Date;
}

export function useSystemValidation() {
  const { user, isAdmin } = useAdminAuth();
  const [stats, setStats] = useState<SystemStats>({
    todaysBookings: 0,
    pendingMessages: 0,
    activeCustomers: 0,
    revenueToday: 0,
    lastUpdate: new Date(),
  });
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    if (!isAdmin || !user || isValidated) return;

    const runValidation = async () => {
      try {
        console.log("🔍 Running system validation...");

        const today = new Date().toISOString().split("T")[0];

        // Test 1: Check today's bookings
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("date", "==", today),
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const revenue = bookings.reduce(
          (sum: number, booking: any) => sum + (booking.revenue || 0),
          0,
        );

        // Test 2: Check conversations
        const conversationsSnapshot = await getDocs(
          collection(db, "conversations"),
        );
        const conversations = conversationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const pendingMessages = conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0,
        );

        // Test 3: Check clients
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const activeCustomers = clientsSnapshot.docs.length;

        const newStats = {
          todaysBookings: bookings.length,
          pendingMessages,
          activeCustomers,
          revenueToday: revenue,
          lastUpdate: new Date(),
        };

        setStats(newStats);
        setIsValidated(true);

        // Show success notification
        toast.success(
          `✅ System Validated: ${newStats.todaysBookings} bookings, ${newStats.pendingMessages} messages, ${newStats.activeCustomers} customers, Ksh${newStats.revenueToday} revenue`,
          { duration: 5000 },
        );

        console.log("✅ System validation complete:", newStats);
      } catch (error: any) {
        console.error("❌ System validation failed:", error);
        toast.error(`System validation failed: ${error.message}`);
      }
    };

    // Run validation after a short delay
    const timer = setTimeout(runValidation, 1000);
    return () => clearTimeout(timer);
  }, [isAdmin, user, isValidated]);

  // Setup real-time listeners after initial validation
  useEffect(() => {
    if (!isValidated || !isAdmin) return;

    console.log("🔄 Setting up real-time listeners...");

    const today = new Date().toISOString().split("T")[0];

    // Real-time bookings listener
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", "==", today),
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const revenue = bookings.reduce(
        (sum: number, booking: any) => sum + (booking.revenue || 0),
        0,
      );

      setStats((prev) => ({
        ...prev,
        todaysBookings: bookings.length,
        revenueToday: revenue,
        lastUpdate: new Date(),
      }));
    });

    // Real-time conversations listener
    const unsubscribeConversations = onSnapshot(
      collection(db, "conversations"),
      (snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const pendingMessages = conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0,
        );

        setStats((prev) => ({
          ...prev,
          pendingMessages,
          lastUpdate: new Date(),
        }));
      },
    );

    // Real-time clients listener
    const unsubscribeClients = onSnapshot(
      collection(db, "clients"),
      (snapshot) => {
        setStats((prev) => ({
          ...prev,
          activeCustomers: snapshot.docs.length,
          lastUpdate: new Date(),
        }));
      },
    );

    return () => {
      unsubscribeBookings();
      unsubscribeConversations();
      unsubscribeClients();
    };
  }, [isValidated, isAdmin]);

  return {
    stats,
    isValidated,
    lastUpdate: stats.lastUpdate,
  };
}
