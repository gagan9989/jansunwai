"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { FileText, User, Edit, Lock, LogOut, Clock, CheckCircle, AlertCircle, Menu } from "lucide-react"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = false

export default function AppealDashboard() {
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
          className="flex items-center space-x-2 p-3 bg-blue-800 rounded hover:bg-blue-700 w-full text-left"
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
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{t("appealDashboard")}</h1>
              <p className="text-sm lg:text-base text-gray-600">Manage and track your appeals</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <Card className="bg-purple-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">0</div>
                      <div className="text-sm lg:text-lg">Total Appeals Filed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <Clock className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">0</div>
                      <div className="text-sm lg:text-lg">Appeals Under Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">0</div>
                      <div className="text-sm lg:text-lg">Appeals Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appeals List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">List of Appeals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{t("show")}</span>
                    <Select defaultValue="10">
                      <SelectTrigger className="w-16 lg:w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm">{t("entries")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{t("search")}:</span>
                    <Input className="w-full lg:w-64" placeholder={`${t("search")}...`} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs lg:text-sm">{t("sn")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">Appeal Number</TableHead>
                        <TableHead className="text-xs lg:text-sm">Original Grievance</TableHead>
                        <TableHead className="text-xs lg:text-sm">Appeal Date</TableHead>
                        <TableHead className="text-xs lg:text-sm">Appeal Reason</TableHead>
                        <TableHead className="text-xs lg:text-sm">{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm lg:text-base">
                          No appeals found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-4 space-y-4 lg:space-y-0">
                  <span className="text-xs lg:text-sm text-gray-600">No entries found</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm bg-transparent">
                      {t("first")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm bg-transparent">
                      {t("prev")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm bg-transparent">
                      {t("next")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm bg-transparent">
                      {t("last")}
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
