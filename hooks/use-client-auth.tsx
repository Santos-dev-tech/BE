"use client"

import { useState, useEffect } from "react"
import {
  type User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface ClientProfile {
  uid: string
  email: string
  displayName: string
  phone: string
  createdAt: Date
  isClient: boolean
}

export function useClientAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const clientDoc = await getDoc(doc(db, "clients", user.uid))
          if (clientDoc.exists()) {
            setClientProfile(clientDoc.data() as ClientProfile)
          } else {
            // profile not created yet → sign-up flow will create
            setClientProfile(null)
          }
        } catch (err: any) {
          // Permission error or network failure – don't crash the app
          console.error("Error fetching client profile:", err.message)
          setClientProfile(null)
        }
      } else {
        setClientProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [mounted])

  const registerClient = async (email: string, password: string, displayName: string, phone: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })

    const clientData = {
      uid: result.user.uid,
      email,
      displayName,
      phone,
      createdAt: new Date(),
      isClient: true,
    }

    await setDoc(doc(db, "clients", result.user.uid), clientData)
    setClientProfile(clientData)

    return result
  }

  const loginClient = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  return {
    user,
    clientProfile,
    loading: loading || !mounted,
    registerClient,
    loginClient,
    logout,
  }
}
