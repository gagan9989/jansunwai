"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin' | 'department_admin'
  department?: string
  permissions: string[]
  name: string
  created_at: string
}

interface AdminAuthStore {
  admin: AdminUser | null
  loading: boolean
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => Promise<void>
  isAdminAuthenticated: () => boolean
  hasPermission: (permission: string) => boolean
  refreshAdmin: () => Promise<void>
}

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: false,

      adminLogin: async (email: string, password: string) => {
        set({ loading: true })
        try {
          // First authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false })
            return { success: false, error: error instanceof Error ? error.message : String(error) }
          }

          if (data.user) {
            // Check if user is an admin
            const { data: adminData, error: adminError } = await supabase
              .from("admin_users")
              .select("*")
              .eq("user_id", data.user.id)
              .single()

            if (adminError || !adminData) {
              set({ loading: false })
              return { success: false, error: "Access denied. Admin privileges required." }
            }

            set({ 
              admin: {
                id: adminData.id,
                email: data.user.email!,
                role: adminData.role,
                department: adminData.department,
                permissions: adminData.permissions || [],
                name: adminData.name,
                created_at: adminData.created_at
              }, 
              loading: false 
            })
            
            return { success: true }
          }

          set({ loading: false })
          return { success: false, error: "Login failed" }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: "An unexpected error occurred" }
        }
      },

      adminLogout: async () => {
        try {
          await supabase.auth.signOut()
          set({ admin: null })
        } catch (error) {
          console.error("Admin logout error:", error)
        }
      },

      isAdminAuthenticated: () => {
        const { admin } = get()
        return !!admin
      },

      hasPermission: (permission: string) => {
        const { admin } = get()
        if (!admin) return false
        return admin.permissions.includes(permission) || admin.role === 'super_admin'
      },

      refreshAdmin: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: adminData, error } = await supabase
              .from("admin_users")
              .select("*")
              .eq("user_id", user.id)
              .single()

            if (!error && adminData) {
              set({ 
                admin: {
                  id: adminData.id,
                  email: user.email!,
                  role: adminData.role,
                  department: adminData.department,
                  permissions: adminData.permissions || [],
                  name: adminData.name,
                  created_at: adminData.created_at
                }
              })
            }
          }
        } catch (error) {
          console.error("Error refreshing admin:", error)
        }
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({ admin: state.admin }),
    },
  ),
) 