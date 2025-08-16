"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { complaintsService, type Complaint, type ComplaintResponse } from "@/lib/complaints"
import { FileText, User, Edit, Lock, LogOut, Menu, ArrowLeft, Download, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = false

export default function ComplaintDetail() {
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const complaintId = parseInt(params.id as string)
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
      return
    }

    const loadComplaint = async () => {
      try {
        setLoading(true)
        const complaintData = await complaintsService.getComplaint(complaintId)
        setComplaint(complaintData)
      } catch (error) {
        console.error("Error loading complaint:", error)
        toast({
          title: "Error",
          description: "Failed to load complaint details",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (complaintId) {
      loadComplaint()
    }
  }, [complaintId, isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/signin")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Complaint Not Found</h2>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
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
            {/* Header */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Complaint Details
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600">
                    Registration Number: {complaint.registration_number}
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <Badge className={`${getStatusColor(complaint.status_id)} text-sm`}>
                    {getStatusName(complaint.status_id)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Complaint Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Complaint Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
                      <p className="text-gray-700">{complaint.subject}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
                        <p className="text-gray-700">{complaint.category?.name || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Subcategory</h3>
                        <p className="text-gray-700">{complaint.subcategory?.name || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Complaint Location */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">House No.</h3>
                        <p className="text-gray-700">{complaint.complaint_house_no || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Area</h3>
                        <p className="text-gray-700">{complaint.complaint_area_address || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">City</h3>
                        <p className="text-gray-700">{complaint.complaint_city}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Pincode</h3>
                        <p className="text-gray-700">{complaint.complaint_pincode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {complaint.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">📎</span>
                              <span className="text-sm font-medium">Attachment {index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  window.open(attachment, '_blank')
                                }
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                {/* Status Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Complaint Submitted</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(complaint.created_at), "dd MMM yyyy, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Status Updated</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(complaint.updated_at), "dd MMM yyyy, h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Complainant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complainant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Name</h3>
                      <p className="text-gray-700">
                        {complaint.complainant_first_name} {complaint.complainant_middle_name} {complaint.complainant_last_name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                      <p className="text-gray-700">{complaint.email_address}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Mobile</h3>
                      <p className="text-gray-700">{complaint.mobile_number}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {complaint.telephone_off && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Office Phone</h3>
                        <p className="text-gray-700">{complaint.telephone_off}</p>
                      </div>
                    )}
                    {complaint.telephone_res && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Residence Phone</h3>
                        <p className="text-gray-700">{complaint.telephone_res}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 