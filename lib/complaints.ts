





import { supabase } from "./supabase"

export interface Complaint {
  id: number
  registration_number: string
  user_id: string
  language: string
  category_id: number
  subcategory_id?: number
  subject: string
  description: string
  complaint_house_no?: string
  complaint_area_address?: string
  complaint_zone_ward_no?: string
  complaint_city: string
  complaint_area?: string
  complaint_pincode: string
  complainant_first_name: string
  complainant_middle_name?: string
  complainant_last_name: string
  complainant_house_no?: string
  complainant_area_address?: string
  complainant_zone_ward_no?: string
  complainant_landmark?: string
  complainant_state?: string
  complainant_pincode?: string
  complainant_country: string
  telephone_off?: string
  mobile_number: string
  telephone_res?: string
  email_address: string
  status_id: number
  priority: string
  assigned_to?: string
  assigned_at?: string
  created_at: string
  updated_at: string
  attachments?: string[]
  // Extended fields from joins
  category?: { name: string }
  subcategory?: { name: string }
  status?: { name: string; color: string }
  responses?: ComplaintResponse[]
}

export interface ComplaintCategory {
  id: number
  name: string
  description?: string
}

export interface ComplaintSubcategory {
  id: number
  category_id: number
  name: string
  description?: string
}

export interface ComplaintStatus {
  id: number
  name: string
  description?: string
  color: string
}

export interface ComplaintResponse {
  id: number
  complaint_id: number
  responded_by: string
  response: string
  internal_notes?: string
  created_at: string
}

export const complaintsService = {
  // Get all complaints for the current user
  async getUserComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        category:complaint_categories(name),
        subcategory:complaint_subcategories(name),
        status:complaint_statuses(name, color)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a single complaint by ID
  async getComplaint(id: number): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        category:complaint_categories(name),
        subcategory:complaint_subcategories(name),
        status:complaint_statuses(name, color),
        responses:complaint_responses(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new complaint
  async createComplaint(complaintData: Omit<Complaint, "id" | "registration_number" | "user_id" | "created_at" | "updated_at">): Promise<Complaint> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("complaints")
      .insert([{
        ...complaintData,
        user_id: user.id,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update complaint status
  async updateComplaintStatus(complaintId: number, statusId: number): Promise<void> {
    const { error } = await supabase
      .from("complaints")
      .update({ status_id: statusId })
      .eq("id", complaintId)

    if (error) throw error
  },

  // Get complaint categories
  async getCategories(): Promise<ComplaintCategory[]> {
    const { data, error } = await supabase
      .from("complaint_categories")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  },

  // Get complaint subcategories for a category
  async getSubcategories(categoryId: number): Promise<ComplaintSubcategory[]> {
    const { data, error } = await supabase
      .from("complaint_subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("name")

    if (error) throw error
    return data || []
  },

  // Get complaint statuses
  async getStatuses(): Promise<ComplaintStatus[]> {
    const { data, error } = await supabase
      .from("complaint_statuses")
      .select("*")
      .order("id")

    if (error) throw error
    return data || []
  },

  // Add response to complaint
  async addResponse(complaintId: number, response: string, internalNotes?: string): Promise<ComplaintResponse> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("complaint_responses")
      .insert([{
        complaint_id: complaintId,
        responded_by: user.id,
        response,
        internal_notes: internalNotes,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload file attachment
  async uploadAttachment(file: File, complaintId: number): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const fileExt = file.name.split(".").pop()
    const fileName = `${complaintId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("complaint-attachments")
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from("complaint-attachments")
      .getPublicUrl(fileName)

    return publicUrl
  },
}