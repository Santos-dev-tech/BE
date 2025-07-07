"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { BookingsManager } from "./bookings-manager";
import { MessagingCenter } from "./messaging-center";
import {
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  LogOut,
  Crown,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DashboardStats {
  todaysBookings: number;
  pendingMessages: number;
  activeCustomers: number;
  revenueToday: number;
}

interface Booking {
  id: string;
  status: string;
  date: string;
  createdAt: Timestamp;
  revenue?: number;
}

interface Conversation {
  id: string;
  unreadCount: number;
}

export default function AdminDashboard() {
  const { logout, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    todaysBookings: 0,
    pendingMessages: 0,
    activeCustomers: 0,
    revenueToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Listen to today's bookings
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", ">=", todayStart.toISOString().split("T")[0]),
      where("date", "<", todayEnd.toISOString().split("T")[0]),
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      const todaysBookings = bookings.length;
      const revenueToday = bookings.reduce(
        (sum, booking) => sum + (booking.revenue || 0),
        0,
      );

      setStats((prev) => ({ ...prev, todaysBookings, revenueToday }));

      // Set recent activity
      const activities = bookings.slice(0, 4).map((booking) => ({
        time: new Date().toLocaleTimeString(),
        action: `Booking ${booking.status}`,
        customer: "Customer",
        service: "Beauty Service",
      }));
      setRecentActivity(activities);
    });

    // Listen to conversations for pending messages
    const conversationsQuery = query(collection(db, "conversations"));
    const unsubscribeConversations = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        const pendingMessages = conversations.reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0,
        );
        setStats((prev) => ({ ...prev, pendingMessages }));
      },
    );

    // Listen to clients for active customers count
    const clientsQuery = query(collection(db, "clients"));
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const activeCustomers = snapshot.docs.length;
      setStats((prev) => ({ ...prev, activeCustomers }));
    });

    return () => {
      unsubscribeBookings();
      unsubscribeConversations();
      unsubscribeClients();
    };
  }, []);

  const statsDisplay = [
    {
      title: "Today's Bookings",
      value: stats.todaysBookings.toString(),
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Pending Messages",
      value: stats.pendingMessages.toString(),
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue Today",
      value: `Ksh${stats.revenueToday.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  BeautyExpress Admin
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell userId="x7kAKlgsOESWBxk7soZBO7UbnrO2" />
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest bookings and customer interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{activity.time}</Badge>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-600">
                              {activity.customer} - {activity.service}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent activity today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManager />
          </TabsContent>

          <TabsContent value="messages">
            <MessagingCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
