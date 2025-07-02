"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminSignUpForm from "@/components/auth/admin-signup-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminSignUpPage() {
  const { isAdmin, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin")
    }
  }, [isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isAdmin) {
    return null // Will redirect
  }

  return <AdminSignUpForm />
}
