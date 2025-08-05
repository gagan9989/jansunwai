"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { useAdminAuth } from "@/lib/admin-auth"
import { adminService } from "@/lib/admin-service"
import { complaintsService, type Complaint, type ComplaintResponse } from "@/lib/complaints"
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  FileText, 
  User, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Send
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminComplaintDetail() {
  const router = useRouter()
  const params = useParams()
  const { isAdminAuthenticated, hasPermission } = useAdminAuth()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [responses, setResponses] = useState<ComplaintResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin/signin")
      return
    }

    if (params.id) {
      loadComplaint()
    }
  }, [isAdminAuthenticated, router, params.id])

  const loadComplaint = async () => {
    try {
      setLoading(true)
      const complaintId = parseInt(params.id as string)
      const complaintData = await complaintsService.getComplaint(complaintId)
      
      if (complaintData) {
        setComplaint(complaintData)
        setResponses(complaintData.responses || [])
      } else {
        toast({
          title: "Error",
          description: "Complaint not found",
          variant: "destructive",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error loading complaint:", error)
      toast({
        title: "Error",
        description: "Failed to load complaint details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddResponse = async () => {
    if (!complaint || !responseText.trim()) return

    try {
      await complaintsService.addResponse(
        complaint.id,
        responseText,
        internalNotes
      )
      
      toast({
        title: "Success",
        description: "Response added successfully",
      })
      
      setShowResponseDialog(false)
      setResponseText("")
      setInternalNotes("")
      loadComplaint() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async () => {
    if (!complaint || !newStatus) return

    try {
      await adminService.updateComplaintStatus(
        complaint.id,
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
      loadComplaint() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
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

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1: return <Clock className="h-4 w-4" />
      case 2: return <AlertCircle className="h-4 w-4" />
      case 3: return <AlertCircle className="h-4 w-4" />
      case 4: return <CheckCircle className="h-4 w-4" />
      case 5: return <CheckCircle className="h-4 w-4" />
      case 6: return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Complaint not found</p>
          <Button onClick={() => router.push("/admin/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Complaint #{complaint.registration_number}
                </h1>
                <p className="text-gray-600">{complaint.subject}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(complaint.status_id)}>
                {getStatusIcon(complaint.status_id)}
                <span className="ml-1">{getStatusName(complaint.status_id)}</span>
              </Badge>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button onClick={() => setShowResponseDialog(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Complaint Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subject</Label>
                  <p className="text-lg font-medium">{complaint.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p>{complaint.category?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Subcategory</Label>
                    <p>{complaint.subcategory?.name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <Badge variant="outline">{complaint.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Language</Label>
                    <p className="uppercase">{complaint.language}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complaint Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Complaint Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Address:</strong> {complaint.complaint_area_address}</p>
                  <p><strong>City:</strong> {complaint.complaint_city}</p>
                  <p><strong>Area:</strong> {complaint.complaint_area}</p>
                  <p><strong>Pincode:</strong> {complaint.complaint_pincode}</p>
                  {complaint.complaint_zone_ward_no && (
                    <p><strong>Zone/Ward:</strong> {complaint.complaint_zone_ward_no}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Responses & Updates
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowResponseDialog(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Add Response
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No responses yet</p>
                  ) : (
                    responses.map((response, index) => (
                      <div key={response.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Admin Response</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(response.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{response.response}</p>
                        {response.internal_notes && (
                          <div className="bg-gray-50 p-2 rounded text-sm">
                            <strong>Internal Notes:</strong> {response.internal_notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Complainant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Complainant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p>{`${complaint.complainant_first_name} ${complaint.complainant_middle_name || ''} ${complaint.complainant_last_name}`}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${complaint.email_address}`} className="text-blue-600 hover:underline">
                      {complaint.email_address}
                    </a>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Mobile</Label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`tel:${complaint.mobile_number}`} className="text-blue-600 hover:underline">
                      {complaint.mobile_number}
                    </a>
                  </div>
                </div>
                {complaint.telephone_off && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Office Phone</Label>
                    <p>{complaint.telephone_off}</p>
                  </div>
                )}
                {complaint.telephone_res && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Residence Phone</Label>
                    <p>{complaint.telephone_res}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Complaint Filed</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  {complaint.assigned_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Assigned</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(complaint.assigned_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(complaint.updated_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowStatusDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowResponseDialog(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Response
                </Button>
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    View Attachments
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Response to Complainant</Label>
              <Textarea
                id="response"
                placeholder="Enter your response to the complainant..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add any internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddResponse}>
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Status</Label>
              <Badge className={getStatusColor(complaint.status_id)}>
                {getStatusName(complaint.status_id)}
              </Badge>
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
              <Label htmlFor="statusNotes">Notes (Optional)</Label>
              <Textarea
                id="statusNotes"
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