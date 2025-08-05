"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import {
  FileText,
  User,
  Edit,
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  Menu,
  Calendar,
  MapPin,
} from "lucide-react"

export default function AccountActivity() {
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const SidebarContent = () => (
    <div className="p-4">
      <div className="mb-4 text-center">
        <div className="text-sm text-blue-200">Welcome</div>
        <div className="font-semibold">{user?.name}</div>
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
          className="flex items-center space-x-2 p-3 bg-blue-800 rounded hover:bg-blue-700 w-full text-left"
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
          className="flex items-center space-x-2 p-3 hover:bg-blue-800 rounded w-full text-left"
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

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "login",
      description: "Successful login",
      timestamp: "2024-01-15 10:30 AM",
      ip: "192.168.1.1",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: 2,
      type: "grievance",
      description: "Submitted public grievance",
      timestamp: "2024-01-14 02:15 PM",
      ip: "192.168.1.1",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: 3,
      type: "profile",
      description: "Updated profile information",
      timestamp: "2024-01-13 11:45 AM",
      ip: "192.168.1.1",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: 4,
      type: "password",
      description: "Password change attempt",
      timestamp: "2024-01-12 09:20 AM",
      ip: "192.168.1.2",
      device: "Safari on iPhone",
      status: "failed",
    },
  ]

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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{t("accountActivity")}</h1>
              <p className="text-sm lg:text-base text-gray-600">Monitor your account activities and security events</p>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <Card className="bg-blue-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <User className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-lg lg:text-2xl font-bold">Active</div>
                      <div className="text-sm lg:text-base">Account Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-lg lg:text-2xl font-bold">15</div>
                      <div className="text-sm lg:text-base">Total Logins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <Clock className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-lg lg:text-2xl font-bold">Today</div>
                      <div className="text-sm lg:text-base">Last Login</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg bg-gray-50 space-y-2 lg:space-y-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {activity.type === "login" && <User className="w-4 h-4 text-blue-600" />}
                          {activity.type === "grievance" && <FileText className="w-4 h-4 text-blue-600" />}
                          {activity.type === "profile" && <Edit className="w-4 h-4 text-blue-600" />}
                          {activity.type === "password" && <Lock className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm lg:text-base">{activity.description}</div>
                          <div className="flex flex-col lg:flex-row lg:items-center text-xs lg:text-sm text-gray-500 space-y-1 lg:space-y-0 lg:space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{activity.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.ip}</span>
                            </div>
                            <span>{activity.device}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Badge variant={activity.status === "success" ? "default" : "destructive"} className="text-xs">
                          {activity.status === "success" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm">
                    Load More Activities
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg space-y-2 lg:space-y-0">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg space-y-2 lg:space-y-0">
                    <div>
                      <div className="font-medium">Login Notifications</div>
                      <div className="text-sm text-gray-500">Get notified when someone logs into your account</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg space-y-2 lg:space-y-0">
                    <div>
                      <div className="font-medium">Active Sessions</div>
                      <div className="text-sm text-gray-500">Manage devices that are currently logged in</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
