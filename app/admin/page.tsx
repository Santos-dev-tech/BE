"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminLoginForm from "@/components/auth/admin-login-form"
import AdminDashboard from "@/components/admin/admin-dashboard"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { isAdmin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return <AdminLoginForm />
  }

  return <AdminDashboard />
}
