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
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string; debug?: any }>
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
          console.log('🔍 Admin login attempt for:', email)
          
          // First authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          console.log('🔍 Auth result:', { data, error })

          if (error) {
            console.error('❌ Auth error:', error)
            set({ loading: false })
            return { 
              success: false, 
              error: error.message,
              debug: { step: 'auth', error: error.message }
            }
          }

          if (data.user) {
            console.log('✅ Auth successful, user ID:', data.user.id)
            
                         // Check if user is an admin
             console.log('🔍 Checking admin_users table for user_id:', data.user.id)
             
             const { data: adminData, error: adminError } = await supabase
               .from("admin_users")
               .select("*")
               .eq("user_id", data.user.id)
               .single()

            console.log('🔍 Admin check result:', { adminData, adminError })

            if (adminError || !adminData) {
              console.error('❌ Admin check failed:', adminError)
              set({ loading: false })
              return { 
                success: false, 
                error: "Access denied. Admin privileges required.",
                debug: { 
                  step: 'admin_check', 
                  error: adminError?.message,
                  user_id: data.user.id,
                  admin_data: adminData
                }
              }
            }

            console.log('✅ Admin user found:', adminData)

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
            
            console.log('✅ Admin login successful')
            return { 
              success: true,
              debug: { step: 'success', admin: adminData }
            }
          }

          console.error('❌ No user data returned')
          set({ loading: false })
          return { 
            success: false, 
            error: "Login failed",
            debug: { step: 'no_user_data' }
          }
        } catch (error) {
          console.error('❌ Unexpected error:', error)
          set({ loading: false })
          return { 
            success: false, 
            error: "An unexpected error occurred",
            debug: { step: 'catch_block', error: error }
          }
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