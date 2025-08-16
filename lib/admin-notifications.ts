import { notificationService } from "./notifications"
import { emailService } from "./email-service"
import { whatsappService } from "./whatsapp-service"
import { pushNotificationService } from "./push-notifications"
import { supabase } from "./supabase"

export interface AdminNotificationData {
  complaintId: number
  userId: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'complaint_update' | 'status_change' | 'assignment' | 'resolution' | 'general'
  sendEmail?: boolean
  sendWhatsApp?: boolean
  sendPush?: boolean
}

class AdminNotificationService {
  // Send comprehensive notification (in-app + email + WhatsApp + push)
  async sendComprehensiveNotification(data: AdminNotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', data.userId)
        .single()

      if (userError) throw userError

      // Get complaint details
      const { data: complaintData, error: complaintError } = await supabase
        .from('complaints')
        .select('registration_number, subject')
        .eq('id', data.complaintId)
        .single()

      if (complaintError) throw complaintError

      // 1. Create in-app notification
      const notificationResult = await notificationService.createNotification({
        user_id: data.userId,
        title: `Complaint Update - ${complaintData.registration_number}`,
        message: data.message,
        type: data.type,
        category: data.category,
        complaint_id: data.complaintId.toString(),
        action_url: `/dashboard/complaint/${data.complaintId}`,
        is_read: false
      })

      if (!notificationResult.success) {
        console.error('Failed to create in-app notification:', notificationResult.error)
      }

      // 2. Send email notification (if enabled)
      if (data.sendEmail && userData.email) {
        const emailResult = await emailService.sendComplaintUpdateEmail(
          userData.email,
          userData.name || 'User',
          complaintData.registration_number,
          data.message
        )

        if (!emailResult.success) {
          console.error('Failed to send email notification:', emailResult.error)
        }
      }

      // 3. Send WhatsApp notification (if enabled)
      if (data.sendWhatsApp && userData.phone) {
        const whatsappResult = await whatsappService.sendComplaintUpdateWhatsApp(
          userData.phone,
          userData.name || 'User',
          complaintData.registration_number,
          data.message
        )

        if (!whatsappResult.success) {
          console.error('Failed to send WhatsApp notification:', whatsappResult.error)
        }
      }

      // 4. Send push notification (if enabled)
      if (data.sendPush) {
        const pushResult = await pushNotificationService.sendComplaintUpdateNotification(
          complaintData.registration_number,
          data.message
        )

        if (!pushResult.success) {
          console.error('Failed to send push notification:', pushResult.error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending comprehensive notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Send status update notification
  async sendStatusUpdateNotification(
    complaintId: number,
    userId: string,
    newStatus: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const notificationData: AdminNotificationData = {
      complaintId,
      userId,
      message: message || `Your complaint status has been updated to: ${newStatus}`,
      type: 'info',
      category: 'status_change',
      sendEmail: true,
      sendPush: true
    }

    return this.sendComprehensiveNotification(notificationData)
  }

  // Send assignment notification
  async sendAssignmentNotification(
    complaintId: number,
    userId: string,
    department: string
  ): Promise<{ success: boolean; error?: string }> {
    const notificationData: AdminNotificationData = {
      complaintId,
      userId,
      message: `Your complaint has been assigned to ${department} for review.`,
      type: 'info',
      category: 'assignment',
      sendEmail: true,
      sendPush: true
    }

    return this.sendComprehensiveNotification(notificationData)
  }

  // Send resolution notification
  async sendResolutionNotification(
    complaintId: number,
    userId: string,
    resolution: string
  ): Promise<{ success: boolean; error?: string }> {
    const notificationData: AdminNotificationData = {
      complaintId,
      userId,
      message: `🎉 Your complaint has been resolved! Resolution: ${resolution}`,
      type: 'success',
      category: 'resolution',
      sendEmail: true,
      sendWhatsApp: true,
      sendPush: true
    }

    return this.sendComprehensiveNotification(notificationData)
  }

  // Send urgent notification
  async sendUrgentNotification(
    complaintId: number,
    userId: string,
    urgency: string
  ): Promise<{ success: boolean; error?: string }> {
    const notificationData: AdminNotificationData = {
      complaintId,
      userId,
      message: `🚨 URGENT: Your complaint requires immediate attention. Priority: ${urgency}`,
      type: 'error',
      category: 'complaint_update',
      sendEmail: true,
      sendWhatsApp: true,
      sendPush: true
    }

    return this.sendComprehensiveNotification(notificationData)
  }

  // Send reminder notification
  async sendReminderNotification(
    complaintId: number,
    userId: string,
    daysPending: number
  ): Promise<{ success: boolean; error?: string }> {
    const notificationData: AdminNotificationData = {
      complaintId,
      userId,
      message: `⏰ Reminder: Your complaint has been pending for ${daysPending} days. We're working on it!`,
      type: 'warning',
      category: 'general',
      sendEmail: true,
      sendPush: true
    }

    return this.sendComprehensiveNotification(notificationData)
  }

  // Send bulk notifications to multiple users
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    category: 'complaint_update' | 'status_change' | 'assignment' | 'resolution' | 'general' = 'general'
  ): Promise<{ success: boolean; error?: string; sentCount: number }> {
    let sentCount = 0
    const errors: string[] = []

    for (const userId of userIds) {
      try {
        const result = await notificationService.createNotification({
          user_id: userId,
          title,
          message,
          type,
          category,
          action_url: '/dashboard',
          is_read: false
        })

        if (result.success) {
          sentCount++
        } else {
          errors.push(`Failed to send to user ${userId}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`Error sending to user ${userId}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    if (errors.length > 0) {
      console.error('Bulk notification errors:', errors)
    }

    return {
      success: sentCount > 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      sentCount
    }
  }

  // Send system announcement
  async sendSystemAnnouncement(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<{ success: boolean; error?: string; sentCount: number }> {
    try {
      // Get all active users
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id')
        .not('id', 'is', null)

      if (error) throw error

      const userIds = users.map(user => user.id)

      return this.sendBulkNotification(userIds, title, message, type, 'general')
    } catch (error) {
      console.error('Error sending system announcement:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error), sentCount: 0 }
    }
  }
}

export const adminNotificationService = new AdminNotificationService() 