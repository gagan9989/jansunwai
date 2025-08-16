"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"
import { User } from "@supabase/supabase-js"

interface AuthStore {
  user: User | null
  profile: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: {
    email: string
    password: string
    options?: {
      data?: {
        first_name?: string
        middle_name?: string
        last_name?: string
        phone?: string
        aadhaar_number?: string
        gender?: string
      }
    }
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: () => boolean
  refreshUser: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false })
            return { success: false, error: error instanceof Error ? error.message : String(error) }
          }

          if (data.user) {
            set({ user: data.user, loading: false })
            // Fetch user profile after successful login
            get().fetchProfile()
            return { success: true }
          }

          set({ loading: false })
          return { success: false, error: "Login failed" }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: "An unexpected error occurred" }
        }
      },

      signup: async (userData) => {
        set({ loading: true })
        try {
          // First, create the user account
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: userData.options,
          })

          if (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) }
          }

          if (data.user) {
            // Insert additional user data into profiles table if options.data exists
            if (userData.options?.data) {
              const profileData = userData.options.data
              const fullName = [
                profileData.first_name,
                profileData.middle_name,
                profileData.last_name
              ].filter(Boolean).join(' ')

              const { error: profileError } = await supabase
                .from("profiles")
                .insert([
                  {
                    id: data.user.id,
                    name: fullName,
                    email: userData.email,
                    phone: profileData.phone,
                    first_name: profileData.first_name,
                    middle_name: profileData.middle_name,
                    last_name: profileData.last_name,
                    aadhaar_number: profileData.aadhaar_number,
                    gender: profileData.gender,
                  },
                ])

              if (profileError) {
                console.error("Profile creation error:", profileError)
                // Don't fail the signup if profile creation fails
              }
            }

            set({ user: data.user, loading: false })
            return { success: true }
          }

          set({ loading: false })
          return { success: false, error: "Signup failed" }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: "An unexpected error occurred" }
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, profile: null })
        } catch (error) {
          console.error("Logout error:", error)
        }
      },

      isAuthenticated: () => {
        const { user } = get()
        return !!user
      },

      refreshUser: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          set({ user })
          if (user) {
            get().fetchProfile()
          }
        } catch (error) {
          console.error("Error refreshing user:", error)
        }
      },

      fetchProfile: async () => {
        try {
          const { user } = get()
          if (user) {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single()

            if (!error && profile) {
              set({ profile })
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, profile: state.profile }), // Persist user and profile data
    },
  ),
)

// Initialize auth state on app load
if (typeof window !== "undefined") {
  let isInitialized = false
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!isInitialized) {
      useAuth.setState({ user: session?.user ?? null })
      if (session?.user) {
        useAuth.getState().fetchProfile()
      }
      isInitialized = true
    }
  })

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      useAuth.setState({ user: session?.user ?? null })
      if (session?.user && event === 'SIGNED_IN') {
        useAuth.getState().fetchProfile()
      }
    }
  })

  // Store subscription for cleanup if needed
  if (typeof window !== "undefined") {
    (window as any).__supabaseAuthSubscription = subscription
  }
}