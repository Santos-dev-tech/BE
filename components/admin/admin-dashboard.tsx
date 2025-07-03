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

interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  totalClients: number;
  todayRevenue: number;
  recentActivity: Array<{
    time: string;
    action: string;
    customer: string;
    service: string;
  }>;
}

export default function AdminDashboard() {
  const { logout, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    pendingBookings: 0,
    totalClients: 0,
    todayRevenue: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("auth-token");

      // Fetch bookings to calculate stats
      const bookingsResponse = await fetch("/api/bookings?role=ADMIN", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Fetch users to get client count
      const usersResponse = await fetch("/api/users?role=CLIENT", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (bookingsResponse.ok && usersResponse.ok) {
        const bookings = await bookingsResponse.json();
        const clients = await usersResponse.json();

        const today = new Date().toISOString().split("T")[0];
        const todayBookings = bookings.filter(
          (b: any) => new Date(b.date).toISOString().split("T")[0] === today,
        );

        const pendingBookings = bookings.filter(
          (b: any) => b.status.toLowerCase() === "pending",
        );

        const completedTodayBookings = todayBookings.filter(
          (b: any) => b.status.toLowerCase() === "completed",
        );

        const todayRevenue = completedTodayBookings.reduce(
          (sum: number, b: any) => sum + (b.price || 0),
          0,
        );

        // Create recent activity from latest bookings
        const recentActivity = bookings.slice(0, 4).map((booking: any) => ({
          time: new Date(booking.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          action: getActionForStatus(booking.status),
          customer: booking.customer.name,
          service: booking.service.name,
        }));

        setStats({
          todayBookings: todayBookings.length,
          pendingBookings: pendingBookings.length,
          totalClients: clients.length,
          todayRevenue,
          recentActivity,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionForStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "New booking";
      case "confirmed":
        return "Booking confirmed";
      case "in_progress":
        return "Service started";
      case "completed":
        return "Service completed";
      case "cancelled":
        return "Booking cancelled";
      default:
        return "Booking updated";
    }
  };

  const dashboardStats = [
    {
      title: "Today's Bookings",
      value: loading ? "..." : stats.todayBookings.toString(),
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Pending Bookings",
      value: loading ? "..." : stats.pendingBookings.toString(),
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      title: "Total Clients",
      value: loading ? "..." : stats.totalClients.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue Today",
      value: loading ? "..." : `$${stats.todayRevenue}`,
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
              {dashboardStats.map((stat, index) => (
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
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-pulse">Loading activity...</div>
                    </div>
                  ) : stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
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
                      <p>No recent activity</p>
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
