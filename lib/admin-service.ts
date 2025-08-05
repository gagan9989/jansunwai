import { supabase } from "./supabase"
import { Complaint, ComplaintStatus, ComplaintCategory } from "./complaints"

export interface AdminDashboardStats {
  totalComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
  resolvedComplaints: number
  closedComplaints: number
  rejectedComplaints: number
  averageResolutionTime: number
  complaintsByCategory: { category: string; count: number }[]
  complaintsByStatus: { status: string; count: number }[]
  recentComplaints: Complaint[]
}

export interface AdminUser {
  id: string
  user_id: string
  name: string
  email: string
  role: 'admin' | 'super_admin' | 'department_admin'
  department?: string
  permissions: string[]
  created_at: string
  last_login?: string
}

export interface ComplaintAssignment {
  complaint_id: number
  assigned_to: string
  assigned_by: string
  assigned_at: string
  notes?: string
}

export const adminService = {
  // Dashboard Statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const { data: complaints, error } = await supabase
      .from("complaints")
      .select(`
        *,
        category:complaint_categories(name),
        status:complaint_statuses(name, color)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const totalComplaints = complaints?.length || 0
    const pendingComplaints = complaints?.filter(c => c.status_id === 1).length || 0
    const inProgressComplaints = complaints?.filter(c => c.status_id === 2 || c.status_id === 3).length || 0
    const resolvedComplaints = complaints?.filter(c => c.status_id === 4).length || 0
    const closedComplaints = complaints?.filter(c => c.status_id === 5).length || 0
    const rejectedComplaints = complaints?.filter(c => c.status_id === 6).length || 0

    // Calculate average resolution time
    const resolvedComplaintsWithTime = complaints?.filter(c => c.status_id === 4 || c.status_id === 5) || []
    const totalResolutionTime = resolvedComplaintsWithTime.reduce((acc, complaint) => {
      const created = new Date(complaint.created_at)
      const updated = new Date(complaint.updated_at)
      return acc + (updated.getTime() - created.getTime())
    }, 0)
    const averageResolutionTime = resolvedComplaintsWithTime.length > 0 
      ? totalResolutionTime / resolvedComplaintsWithTime.length 
      : 0

    // Group by category
    const categoryMap = new Map<string, number>()
    complaints?.forEach(complaint => {
      const categoryName = complaint.category?.name || 'Unknown'
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
    })
    const complaintsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }))

    // Group by status
    const statusMap = new Map<string, number>()
    complaints?.forEach(complaint => {
      const statusName = complaint.status?.name || 'Unknown'
      statusMap.set(statusName, (statusMap.get(statusName) || 0) + 1)
    })
    const complaintsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }))

    return {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      rejectedComplaints,
      averageResolutionTime,
      complaintsByCategory,
      complaintsByStatus,
      recentComplaints: complaints?.slice(0, 10) || []
    }
  },

  // Get all complaints with filtering and pagination
  async getAllComplaints(filters?: {
    status?: number
    category?: number
    assigned_to?: string
    date_from?: string
    date_to?: string
    search?: string
  }, page = 1, limit = 20): Promise<{ complaints: Complaint[], total: number, totalPages: number }> {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        category:complaint_categories(name),
        subcategory:complaint_subcategories(name),
        status:complaint_statuses(name, color),
        responses:complaint_responses(*)
      `, { count: 'exact' })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status_id', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,registration_number.ilike.%${filters.search}%`)
    }

    const { data: complaints, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      complaints: complaints || [],
      total,
      totalPages
    }
  },

  // Update complaint status
  async updateComplaintStatus(complaintId: number, statusId: number, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase
      .from("complaints")
      .update({ 
        status_id: statusId,
        updated_at: new Date().toISOString()
      })
      .eq("id", complaintId)

    if (error) throw error

    // Add response if notes provided
    if (notes) {
      await supabase
        .from("complaint_responses")
        .insert([{
          complaint_id: complaintId,
          responded_by: user.id,
          response: notes,
          internal_notes: "Status update"
        }])
    }
  },

  // Assign complaint to admin
  async assignComplaint(complaintId: number, assignedTo: string, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase
      .from("complaints")
      .update({ 
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", complaintId)

    if (error) throw error

    // Add assignment note
    if (notes) {
      await supabase
        .from("complaint_responses")
        .insert([{
          complaint_id: complaintId,
          responded_by: user.id,
          response: `Complaint assigned to ${assignedTo}`,
          internal_notes: notes
        }])
    }
  },

  // Get all admin users
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create new admin user
  async createAdminUser(adminData: {
    user_id: string
    name: string
    email: string
    role: 'admin' | 'super_admin' | 'department_admin'
    department?: string
    permissions: string[]
  }): Promise<AdminUser> {
    const { data, error } = await supabase
      .from("admin_users")
      .insert([adminData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update admin user
  async updateAdminUser(adminId: string, updates: Partial<AdminUser>): Promise<void> {
    const { error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", adminId)

    if (error) throw error
  },

  // Delete admin user
  async deleteAdminUser(adminId: string): Promise<void> {
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", adminId)

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

  // Create new category
  async createCategory(categoryData: { name: string; description?: string }): Promise<ComplaintCategory> {
    const { data, error } = await supabase
      .from("complaint_categories")
      .insert([categoryData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update category
  async updateCategory(categoryId: number, updates: Partial<ComplaintCategory>): Promise<void> {
    const { error } = await supabase
      .from("complaint_categories")
      .update(updates)
      .eq("id", categoryId)

    if (error) throw error
  },

  // Delete category
  async deleteCategory(categoryId: number): Promise<void> {
    const { error } = await supabase
      .from("complaint_categories")
      .delete()
      .eq("id", categoryId)

    if (error) throw error
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

  // Export complaints to CSV
  async exportComplaints(filters?: {
    status?: number
    category?: number
    date_from?: string
    date_to?: string
  }): Promise<string> {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        category:complaint_categories(name),
        status:complaint_statuses(name)
      `)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status_id', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data: complaints, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Convert to CSV
    const headers = [
      'Registration Number',
      'Subject',
      'Category',
      'Status',
      'Complainant Name',
      'Email',
      'Mobile',
      'Created Date',
      'Updated Date'
    ]

    const csvData = complaints?.map(complaint => [
      complaint.registration_number,
      complaint.subject,
      complaint.category?.name || '',
      complaint.status?.name || '',
      `${complaint.complainant_first_name} ${complaint.complainant_last_name}`,
      complaint.email_address,
      complaint.mobile_number,
      complaint.created_at,
      complaint.updated_at
    ]) || []

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }
} 