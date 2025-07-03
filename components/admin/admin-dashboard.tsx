"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { BookingsManager } from "./bookings-manager"
import { MessagingCenter } from "./messaging-center"
import { Calendar, MessageSquare, Users, TrendingUp, LogOut, Crown } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"

export default function AdminDashboard() {
  const { logout, user } = useAdminAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    { title: "Today's Bookings", value: "12", icon: Calendar, color: "text-blue-600" },
    { title: "Pending Messages", value: "5", icon: MessageSquare, color: "text-green-600" },
    { title: "Active Customers", value: "48", icon: Users, color: "text-purple-600" },
    { title: "Revenue Today.", value: "Ksh1,240", icon: TrendingUp, color: "text-orange-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BeautyExpress Admin</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                <CardDescription>Latest bookings and customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "10:30 AM", action: "New booking", customer: "Stylist 1", service: "Gel Manicure" },
                    { time: "11:15 AM", action: "Message received", customer: " 2", service: "Pedicure" },
                    { time: "12:00 PM", action: "Booking confirmed", customer: "Stylist 3", service: "Nail Art" },
                    { time: "1:30 PM", action: "Payment received", customer: "Stylist 4", service: "Full Set" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
                  ))}
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
  )
}
