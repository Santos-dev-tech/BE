"use client"

import { useState, useEffect } from "react"
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

const ADMIN_WHITELIST = {
  uid: "x7kAKlgsOESWBxk7soZBO7UbnrO2",
  email: "zainsantos21@gmail.com",
} as const

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)

      if (
        user && // we have a user
        user.uid === ADMIN_WHITELIST.uid && // UID matches
        user.email === ADMIN_WHITELIST.email
      ) {
        // email matches
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [mounted])

  const loginAdmin = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)

    // Validate against local whitelist
    if (result.user.uid !== ADMIN_WHITELIST.uid || result.user.email !== ADMIN_WHITELIST.email) {
      await signOut(auth)
      throw new Error("Unauthorized: Admin access only")
    }

    return result
  }

  const logout = () => signOut(auth)

  return {
    user,
    isAdmin,
    loading: loading || !mounted,
    loginAdmin,
    logout,
  }
}
