"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { useAdminAuth } from "@/lib/admin-auth"
import { adminService, type AdminDashboardStats } from "@/lib/admin-service"
import { type Complaint } from "@/lib/complaints"
import { 
  BarChart3, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Settings,
  LogOut,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserPlus,
  Plus,
  TrendingUp,
  Calendar,
  MapPin
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = false

export default function AdminDashboard() {
  const router = useRouter()
  const { admin, adminLogout, isAdminAuthenticated, hasPermission } = useAdminAuth()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusNotes, setStatusNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin/signin")
      return
    }

    loadDashboardData()
  }, [isAdminAuthenticated, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, complaintsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllComplaints({}, 1, 20)
      ])
      
      setStats(dashboardStats)
      setComplaints(complaintsData.complaints)
      setTotalPages(complaintsData.totalPages)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin/signin")
  }

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return

    try {
      await adminService.updateComplaintStatus(
        selectedComplaint.id,
        parseInt(newStatus),
        statusNotes
      )
      
      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      })
      
      setShowStatusDialog(false)
      setStatusNotes("")
      setNewStatus("")
      setSelectedComplaint(null)
      loadDashboardData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (searchTerm) filters.search = searchTerm
      if (statusFilter !== "all") filters.status = parseInt(statusFilter)
      if (categoryFilter !== "all") filters.category = parseInt(categoryFilter)
      
      const result = await adminService.getAllComplaints(filters, 1, 20)
      setComplaints(result.complaints)
      setTotalPages(result.totalPages)
      setCurrentPage(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search complaints",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const csvData = await adminService.exportComplaints()
      const blob = new Blob([csvData], { type: 'text/csv' })
      
      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `complaints-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
      
      toast({
        title: "Success",
        description: "Complaints exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export complaints",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return "bg-yellow-100 text-yellow-800"
      case 2: return "bg-blue-100 text-blue-800"
      case 3: return "bg-purple-100 text-purple-800"
      case 4: return "bg-green-100 text-green-800"
      case 5: return "bg-gray-100 text-gray-800"
      case 6: return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

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

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {admin?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50">
                {admin?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalComplaints || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time complaints
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pendingComplaints || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.inProgressComplaints || 0}</div>
              <p className="text-xs text-muted-foreground">
                Being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.resolvedComplaints || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.complaintsByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / (stats?.totalComplaints || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaints by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.complaintsByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.status}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / (stats?.totalComplaints || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Complaints Management</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {hasPermission('manage_categories') && (
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
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
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Complaints Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Complainant</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">
                        {complaint.registration_number}
                      </TableCell>
                      <TableCell>{complaint.subject}</TableCell>
                      <TableCell>{complaint.category?.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status_id)}>
                          {getStatusName(complaint.status_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {`${complaint.complainant_first_name} ${complaint.complainant_last_name}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint)
                              setShowStatusDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Complaint</Label>
              <p className="text-sm text-gray-600">
                {selectedComplaint?.registration_number} - {selectedComplaint?.subject}
              </p>
            </div>
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Pending</SelectItem>
                  <SelectItem value="2">Under Review</SelectItem>
                  <SelectItem value="3">In Progress</SelectItem>
                  <SelectItem value="4">Resolved</SelectItem>
                  <SelectItem value="5">Closed</SelectItem>
                  <SelectItem value="6">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 