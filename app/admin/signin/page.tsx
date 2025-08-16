"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Eye, EyeOff, Loader2, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/lib/admin-auth-debug"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

export default function AdminSignIn() {
  const router = useRouter()
  const { adminLogin, isAdminAuthenticated, loading } = useAdminAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.push("/admin/dashboard")
    }
  }, [isAdminAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await adminLogin(formData.email, formData.password)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Admin login successful! Redirecting to admin dashboard...",
        })
        router.push("/admin/dashboard")
      } else {
        console.log('🔍 Debug info:', result.debug)
        toast({
          title: "Error",
          description: result.error || "Invalid admin credentials. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-red-900">Admin Portal</CardTitle>
              <p className="text-gray-600">Secure access for authorized personnel</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-red-900 hover:bg-red-800" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Admin Login"
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <Link href="#" className="text-sm text-red-600 hover:underline">
                  Forgot admin credentials?
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link href="/" className="text-blue-600 hover:underline">
                  ← Back to Main Portal
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
