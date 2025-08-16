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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth"
import { FileText, User, Edit, Lock, LogOut, Upload, Loader2, Menu } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { complaintsService, type ComplaintCategory, type ComplaintSubcategory } from "@/lib/complaints"
import { Chatbot } from "@/components/chatbot"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

export default function LodgeGrievance() {
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sameAsComplaintLocation, setSameAsComplaintLocation] = useState(false)
  const [categories, setCategories] = useState<ComplaintCategory[]>([])
  const [subcategories, setSubcategories] = useState<ComplaintSubcategory[]>([])

  const [formData, setFormData] = useState({
    // Section 1: Select Language and City
    language: "en", // Default to English
    city: "",

    // Section 2: Define Nature of Your Complaint
    category: "",
    subCategory: "", // New field
    subject: "",
    description: "",

    // Section 3: Specify Location of Your Complaint
    complaintHouseNo: "", // New field
    complaintAreaAddress: "", // New field
    complaintZoneWardNo: "", // New field
    complaintCity: "", // New field
    complaintArea: "", // New field
    complaintPincode: "", // New field

    // Section 4: Name of Complainant
    firstName: "", // New field
    middleName: "", // New field
    lastName: "", // New field

    // Section 5: Address of Complainant
    complainantHouseNo: "", // New field
    complainantAreaAddress: "", // New field
    complainantZoneWardNo: "", // New field
    complainantLandmark: "", // New field
    complainantState: "", // New field
    complainantPincode: "", // New field
    complainantCountry: "", // New field

    // Section 6: Contact Details of Complainant
    telephoneOff: "", // New field
    mobileNumber: "", // New field
    telephoneRes: "", // New field
    emailAddress: "", // New field

    // Section 7: Documents and Submission
    attachments: [] as File[],
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
    }
  }, [isAuthenticated, router])

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await complaintsService.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "Failed to load complaint categories",
          variant: "destructive",
        })
      }
    }
    loadCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.category) {
        try {
          const subcats = await complaintsService.getSubcategories(parseInt(formData.category))
          setSubcategories(subcats)
        } catch (error) {
          console.error("Error loading subcategories:", error)
        }
      } else {
        setSubcategories([])
      }
    }
    loadSubcategories()
  }, [formData.category])

  useEffect(() => {
    if (sameAsComplaintLocation) {
      setFormData((prev) => ({
        ...prev,
        complainantHouseNo: prev.complaintHouseNo,
        complainantAreaAddress: prev.complaintAreaAddress,
        complainantZoneWardNo: prev.complaintZoneWardNo,
        complainantPincode: prev.complaintPincode,
        // Note: City, Area, State, Country might differ or need specific mapping
        // For simplicity, copying direct matches.
        complainantState: prev.complaintCity === "delhi" ? "delhi" : "", // Example mapping
        complainantCountry: "india", // Assuming India for now
      }))
    } else {
      // Clear complainant address fields if checkbox is unchecked
      setFormData((prev) => ({
        ...prev,
        complainantHouseNo: "",
        complainantAreaAddress: "",
        complainantZoneWardNo: "",
        complainantLandmark: "",
        complainantState: "",
        complainantPincode: "",
        complainantCountry: "",
      }))
    }
  }, [
    sameAsComplaintLocation,
    formData.complaintHouseNo,
    formData.complaintAreaAddress,
    formData.complaintZoneWardNo,
    formData.complaintPincode,
    formData.complaintCity,
  ])

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
      // Upload attachments if any
      let attachmentUrls: string[] = []
      if (formData.attachments) {
        for (const file of formData.attachments) {
          const url = await complaintsService.uploadAttachment(file, Date.now()) // temporary ID
          attachmentUrls.push(url)
        }
      }

      // Create complaint
      const complaintData = {
        language: formData.language,
        category_id: parseInt(formData.category),
        subcategory_id: formData.subCategory ? parseInt(formData.subCategory) : undefined,
        subject: formData.subject,
        description: formData.description,
        complaint_house_no: formData.complaintHouseNo,
        complaint_area_address: formData.complaintAreaAddress,
        complaint_zone_ward_no: formData.complaintZoneWardNo,
        complaint_city: formData.complaintCity,
        complaint_area: formData.complaintArea,
        complaint_pincode: formData.complaintPincode,
        complainant_first_name: formData.firstName,
        complainant_middle_name: formData.middleName,
        complainant_last_name: formData.lastName,
        complainant_house_no: formData.complainantHouseNo,
        complainant_area_address: formData.complainantAreaAddress,
        complainant_zone_ward_no: formData.complainantZoneWardNo,
        complainant_landmark: formData.complainantLandmark,
        complainant_state: formData.complainantState,
        complainant_pincode: formData.complainantPincode,
        complainant_country: formData.complainantCountry,
        telephone_off: formData.telephoneOff,
        mobile_number: formData.mobileNumber,
        telephone_res: formData.telephoneRes,
        email_address: formData.emailAddress,
        status_id: 1, // Default to "Pending" status
        priority: "normal", // Default priority
        attachments: attachmentUrls,
      }

      const complaint = await complaintsService.createComplaint(complaintData)

      toast({
        title: "Success",
        description: `Grievance submitted successfully! Reference ID: ${complaint.registration_number}`,
      })

      // Reset form
      setFormData({
        language: "en",
        city: "",
        category: "",
        subCategory: "",
        subject: "",
        description: "",
        complaintHouseNo: "",
        complaintAreaAddress: "",
        complaintZoneWardNo: "",
        complaintCity: "",
        complaintArea: "",
        complaintPincode: "",
        firstName: "",
        middleName: "",
        lastName: "",
        complainantHouseNo: "",
        complainantAreaAddress: "",
        complainantZoneWardNo: "",
        complainantLandmark: "",
        complainantState: "",
        complainantPincode: "",
        complainantCountry: "",
        telephoneOff: "",
        mobileNumber: "",
        telephoneRes: "",
        emailAddress: "",
        attachments: [],
      })
      setSameAsComplaintLocation(false)
    } catch (error) {
      console.error("Error submitting complaint:", error)
      toast({
        title: "Error",
        description: "Failed to submit grievance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Validate file types and sizes
      const validFiles = fileArray.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.`,
            variant: "destructive",
          })
          return false
        }
        
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
            variant: "destructive",
          })
          return false
        }
        
        return true
      })
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('word')) return '📝'
    return '📎'
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
          className="flex items-center space-x-2 p-3 bg-blue-800 rounded hover:bg-blue-700 w-full text-left"
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
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{t("lodgePublicGrievance")}</h1>
              <p className="text-sm lg:text-base text-gray-600">Submit your public grievance for resolution</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Grievance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Select Language and City */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 1: Select Language and City</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Select Language *</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleInputChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिंदी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Select City *</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delhi">{t("delhi")}</SelectItem>
                            <SelectItem value="mumbai">{t("maharashtra")}</SelectItem>
                            <SelectItem value="bengaluru">{t("karnataka")}</SelectItem>
                            <SelectItem value="chennai">{t("tamilNadu")}</SelectItem>
                            <SelectItem value="lucknow">{t("uttarPradesh")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Define Nature of Your Complaint */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 2: Define Nature of Your Complaint</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Select Complaint Type *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subCategory">Select Complaint Subtype</Label>
                        <Select
                          value={formData.subCategory}
                          onValueChange={(value) => handleInputChange("subCategory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subtype" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief subject of your grievance"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description in Brief *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed description of your grievance..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Section 3: Specify Location of Your Complaint */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Section 3: Specify Location of Your Complaint
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="complaintHouseNo">House No. *</Label>
                        <Input
                          id="complaintHouseNo"
                          placeholder="Enter House No."
                          value={formData.complaintHouseNo}
                          onChange={(e) => handleInputChange("complaintHouseNo", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintAreaAddress">Area in Address *</Label>
                        <Input
                          id="complaintAreaAddress"
                          placeholder="Enter Area in Address"
                          value={formData.complaintAreaAddress}
                          onChange={(e) => handleInputChange("complaintAreaAddress", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintZoneWardNo">Zone No. / Ward No.</Label>
                        <Input
                          id="complaintZoneWardNo"
                          placeholder="Enter Zone No. / Ward No."
                          value={formData.complaintZoneWardNo}
                          onChange={(e) => handleInputChange("complaintZoneWardNo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintCity">City *</Label>
                        <Input
                          id="complaintCity"
                          placeholder="Enter City"
                          value={formData.complaintCity}
                          onChange={(e) => handleInputChange("complaintCity", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintArea">Area</Label>
                        <Input
                          id="complaintArea"
                          placeholder="Enter Area"
                          value={formData.complaintArea}
                          onChange={(e) => handleInputChange("complaintArea", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintPincode">Pincode *</Label>
                        <Input
                          id="complaintPincode"
                          placeholder="Enter Pincode"
                          value={formData.complaintPincode}
                          onChange={(e) => handleInputChange("complaintPincode", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Name of Complainant */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 4: Name of Complainant</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter First Name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          placeholder="Enter Middle Name"
                          value={formData.middleName}
                          onChange={(e) => handleInputChange("middleName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter Last Name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Address of Complainant */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 5: Address of Complainant</h2>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="sameAsAbove"
                        checked={sameAsComplaintLocation}
                        onCheckedChange={(checked) => setSameAsComplaintLocation(checked as boolean)}
                      />
                      <Label htmlFor="sameAsAbove" className="text-sm">
                        Same as complaint location
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="complainantHouseNo">House No. *</Label>
                        <Input
                          id="complainantHouseNo"
                          placeholder="Enter House No."
                          value={formData.complainantHouseNo}
                          onChange={(e) => handleInputChange("complainantHouseNo", e.target.value)}
                          required
                          disabled={sameAsComplaintLocation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantAreaAddress">Area in Address *</Label>
                        <Input
                          id="complainantAreaAddress"
                          placeholder="Enter Area in Address"
                          value={formData.complainantAreaAddress}
                          onChange={(e) => handleInputChange("complainantAreaAddress", e.target.value)}
                          required
                          disabled={sameAsComplaintLocation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantZoneWardNo">Zone No. / Ward No.</Label>
                        <Input
                          id="complainantZoneWardNo"
                          placeholder="Enter Zone No. / Ward No."
                          value={formData.complainantZoneWardNo}
                          onChange={(e) => handleInputChange("complainantZoneWardNo", e.target.value)}
                          disabled={sameAsComplaintLocation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantLandmark">Landmark</Label>
                        <Input
                          id="complainantLandmark"
                          placeholder="Enter Landmark"
                          value={formData.complainantLandmark}
                          onChange={(e) => handleInputChange("complainantLandmark", e.target.value)}
                          disabled={sameAsComplaintLocation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantState">State *</Label>
                        <Select
                          value={formData.complainantState}
                          onValueChange={(value) => handleInputChange("complainantState", value)}
                          disabled={sameAsComplaintLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delhi">{t("delhi")}</SelectItem>
                            <SelectItem value="maharashtra">{t("maharashtra")}</SelectItem>
                            <SelectItem value="karnataka">{t("karnataka")}</SelectItem>
                            <SelectItem value="tamil-nadu">{t("tamilNadu")}</SelectItem>
                            <SelectItem value="uttar-pradesh">{t("uttarPradesh")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantPincode">Pincode *</Label>
                        <Input
                          id="complainantPincode"
                          placeholder="Enter Pincode"
                          value={formData.complainantPincode}
                          onChange={(e) => handleInputChange("complainantPincode", e.target.value)}
                          required
                          disabled={sameAsComplaintLocation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complainantCountry">Country *</Label>
                        <Select
                          value={formData.complainantCountry}
                          onValueChange={(value) => handleInputChange("complainantCountry", value)}
                          disabled={sameAsComplaintLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">USA</SelectItem>
                            <SelectItem value="uk">UK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Contact Details of Complainant */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 6: Contact Details of Complainant</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telephoneOff">Telephone (Off.)</Label>
                        <Input
                          id="telephoneOff"
                          placeholder="Enter Office Telephone"
                          value={formData.telephoneOff}
                          onChange={(e) => handleInputChange("telephoneOff", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber">Mobile No. *</Label>
                        <Input
                          id="mobileNumber"
                          type="tel"
                          placeholder="Enter Mobile Number"
                          value={formData.mobileNumber}
                          onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephoneRes">Telephone (Res.)</Label>
                        <Input
                          id="telephoneRes"
                          placeholder="Enter Residence Telephone"
                          value={formData.telephoneRes}
                          onChange={(e) => handleInputChange("telephoneRes", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailAddress">E-Mail Address *</Label>
                        <Input
                          id="emailAddress"
                          type="email"
                          placeholder="Enter Email Address"
                          value={formData.emailAddress}
                          onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Documents and Submission */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Section 7: Documents and Submission</h2>
                    <div className="space-y-4">
                      <Label htmlFor="attachments">Upload Documents (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
                        <div className="mt-2">
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>
                        <p className="text-xs lg:text-sm text-gray-500 mt-2">
                          Upload supporting documents (PDF, DOC, DOCX, JPG, PNG - Max 5MB each)
                        </p>
                      </div>
                      
                      {/* File Preview */}
                      {formData.attachments.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selected Files ({formData.attachments.length})</Label>
                          <div className="space-y-2">
                            {formData.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{getFileIcon(file.type)}</span>
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 pt-4">
                      <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Grievance"
                        )}
                      </Button>
                      <Button type="button" variant="outline">
                        Save as Draft
                      </Button>
                    </div>
                  </div>
                </form>
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
