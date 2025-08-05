"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { complaintsService, type Complaint } from "@/lib/complaints"
import { FileText, User, Edit, Lock, LogOut, Clock, CheckCircle, Menu, Eye, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Chatbot } from "@/components/chatbot"
import { NotificationCenter } from "@/components/notification-center"

export default function Dashboard() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Load complaints on component mount
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true)
        const userComplaints = await complaintsService.getUserComplaints()
        setComplaints(userComplaints)
      } catch (error) {
        console.error("Error loading complaints:", error)
        toast({
          title: "Error",
          description: "Failed to load complaints",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadComplaints()
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/signin")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  // Calculate statistics
  const totalComplaints = complaints.length
  const pendingComplaints = complaints.filter(c => c.status_id === 1 || c.status_id === 2).length
  const closedComplaints = complaints.filter(c => c.status_id === 4 || c.status_id === 5).length

  // Filter complaints based on search and status
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status_id.toString() === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage)

  // Get status color
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return "bg-yellow-100 text-yellow-800" // Pending
      case 2: return "bg-blue-100 text-blue-800" // Under Review
      case 3: return "bg-purple-100 text-purple-800" // In Progress
      case 4: return "bg-green-100 text-green-800" // Resolved
      case 5: return "bg-gray-100 text-gray-800" // Closed
      case 6: return "bg-red-100 text-red-800" // Rejected
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Get status name
  const getStatusName = (statusId: number) => {
    switch (statusId) {
      case 1: return "Pending"
      case 2: return "Under Review"
      case 3: return "In Progress"
      case 4: return "Resolved"
      case 5: return "Closed"
      case 6: return "Rejected"
      default: return "Unknown"
    }
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
          className="flex items-center space-x-2 p-3 bg-blue-800 rounded hover:bg-blue-700 w-full text-left"
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
          <div className="flex-1 lg:ml-0 ml-0">
            {/* Header with Notification Center */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <NotificationCenter userId={user?.id || "current-user-id"} />
                <Button onClick={() => router.push("/dashboard/lodge-grievance")}>
                  Lodge Grievance
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <Card className="bg-orange-500 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <FileText className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">{totalComplaints}</div>
                      <div className="text-sm lg:text-lg">{t("totalGrievances")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <Clock className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">{pendingComplaints}</div>
                      <div className="text-sm lg:text-lg">{t("pendingGrievances")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-600 text-white sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-4xl font-bold">{closedComplaints}</div>
                      <div className="text-sm lg:text-lg">{t("closedGrievances")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grievances List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t("listGrievances")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{t("show")}</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        className="w-full lg:w-64 pl-10" 
                        placeholder={`${t("search")}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="1">Pending</SelectItem>
                        <SelectItem value="2">Under Review</SelectItem>
                        <SelectItem value="3">In Progress</SelectItem>
                        <SelectItem value="4">Resolved</SelectItem>
                        <SelectItem value="5">Closed</SelectItem>
                        <SelectItem value="6">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs lg:text-sm">{t("sn")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">{t("registrationNumber")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">{t("receivedDate")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">{t("grievanceDescription")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">{t("status")}</TableHead>
                        <TableHead className="text-xs lg:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                              <span className="ml-2">Loading complaints...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedComplaints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm lg:text-base">
                            {searchTerm || statusFilter !== "all" ? t("noEntriesFound") : t("noDataAvailable")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedComplaints.map((complaint, index) => (
                          <TableRow key={complaint.id}>
                            <TableCell className="text-xs lg:text-sm">{startIndex + index + 1}</TableCell>
                            <TableCell className="text-xs lg:text-sm font-mono">{complaint.registration_number}</TableCell>
                            <TableCell className="text-xs lg:text-sm">
                              {format(new Date(complaint.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="text-xs lg:text-sm max-w-xs truncate">
                              {complaint.subject}
                            </TableCell>
                            <TableCell className="text-xs lg:text-sm">
                              <Badge className={getStatusColor(complaint.status_id)}>
                                {getStatusName(complaint.status_id)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs lg:text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/complaint/${complaint.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-4 space-y-4 lg:space-y-0">
                  <span className="text-xs lg:text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs lg:text-sm bg-transparent"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      {t("first")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs lg:text-sm bg-transparent"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t("prev")}
                    </Button>
                    <span className="text-xs lg:text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs lg:text-sm bg-transparent"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t("next")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs lg:text-sm bg-transparent"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      {t("last")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
