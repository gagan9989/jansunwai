"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { FileText, Upload, Loader2, Plus, List, User, LogOut } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

export default function ComplaintsPage() {
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("lodge")
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    department: "",
    priority: "",
    attachments: null as File[] | null,
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success",
        description: "Complaint submitted successfully! Reference ID: CMP2024001",
      })

      // Reset form
      setFormData({
        category: "",
        subject: "",
        description: "",
        department: "",
        priority: "",
        attachments: null,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* User Info Bar */}
      <div className="bg-blue-900 text-white py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <User className="w-5 h-5" />
            <span>Welcome, {user.user_metadata?.name || user.email}</span>
            <span className="text-blue-200">|</span>
            <span className="text-blue-200">{user.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={() => setActiveTab("lodge")}
            variant={activeTab === "lodge" ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Lodge Complaint</span>
          </Button>
          <Button
            onClick={() => setActiveTab("track")}
            variant={activeTab === "track" ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <List className="w-4 h-4" />
            <span>Track Complaints</span>
          </Button>
        </div>

        {/* Lodge Complaint Tab */}
        {activeTab === "lodge" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>Lodge New Complaint</span>
              </CardTitle>
              <p className="text-gray-600">Submit your complaint for resolution</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Complaint Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public-services">Public Services</SelectItem>
                        <SelectItem value="corruption">Corruption</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal Corporation</SelectItem>
                        <SelectItem value="police">Police Department</SelectItem>
                        <SelectItem value="health">Health Department</SelectItem>
                        <SelectItem value="education">Education Department</SelectItem>
                        <SelectItem value="transport">Transport Department</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief subject of your complaint"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of your complaint..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Button type="button" variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload supporting documents (PDF, JPG, PNG - Max 5MB each)
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Track Complaints Tab */}
        {activeTab === "track" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <List className="w-6 h-6" />
                <span>Track Your Complaints</span>
              </CardTitle>
              <p className="text-gray-600">Monitor the status of your submitted complaints</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
                <p className="text-gray-500 mb-4">You haven't submitted any complaints yet.</p>
                <Button onClick={() => setActiveTab("lodge")} className="bg-blue-900 hover:bg-blue-800">
                  Lodge Your First Complaint
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
