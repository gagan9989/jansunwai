"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { FileText, User, Edit, Lock, LogOut, Eye, EyeOff, Loader2, Menu } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = false

export default function ChangePassword() {
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/signin")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        })
        return
      }

      if (formData.newPassword.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        })
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Success",
        description: "Password changed successfully!",
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const SidebarContent = () => (
    <div className="p-4">
      <div className="mb-4 text-center">
        <div className="text-sm text-blue-200">Welcome</div>
        <div className="font-semibold">{user?.user_metadata?.name || user?.email || "User"}</div>
      </div>
      <nav className="space-y-2">
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
        >
          <FileText className="w-5 h-5" />
          <span>{t("grievanceDashboard")}</span>
        </button>
        <button
          onClick={() => handleNavigation("/dashboard/appeal")}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
        >
          <FileText className="w-5 h-5" />
          <span>{t("appealDashboard")}</span>
        </button>
        <button
          onClick={() => handleNavigation("/dashboard/lodge-grievance")}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
        >
          <FileText className="w-5 h-5" />
          <span>{t("lodgePublicGrievance")}</span>
        </button>
        <button
          onClick={() => handleNavigation("/dashboard/activity")}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
        >
          <User className="w-5 h-5" />
          <span>{t("accountActivity")}</span>
        </button>
        <button
          onClick={() => handleNavigation("/dashboard/profile")}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
        >
          <Edit className="w-5 h-5" />
          <span>{t("editProfile")}</span>
        </button>
        <button
          onClick={() => handleNavigation("/dashboard/change-password")}
          className="flex items-center space-x-2 p-3 bg-blue-800 rounded hover:bg-blue-700 w-full text-left"
        >
          <Lock className="w-5 h-5" />
          <span>{t("changePassword")}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded text-yellow-300 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>{t("signOut")}</span>
        </button>
      </nav>
    </div>
  )

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 bg-blue-900 text-white rounded-lg">
            <SidebarContent />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-20 left-4 z-50">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-blue-900 text-white border-blue-900">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-blue-900 text-white border-blue-800 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{t("changePassword")}</h1>
              <p className="text-sm lg:text-base text-gray-600">Update your account password</p>
            </div>

            <Card className="max-w-full lg:max-w-md">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 pt-4">
                    <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
