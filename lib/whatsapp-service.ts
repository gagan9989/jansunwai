import { supabase } from "./supabase"

export interface WhatsAppMessage {
  to: string
  message: string
  template?: string
  variables?: Record<string, string>
}

class WhatsAppService {
  // Send WhatsApp message using WhatsApp Business API (free tier)
  async sendWhatsAppMessage(message: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
    try {
      // Using Supabase Edge Function for WhatsApp sending
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: message.to,
          message: message.message,
          template: message.template,
          variables: message.variables
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Send complaint status update via WhatsApp
  async sendComplaintUpdateWhatsApp(
    phoneNumber: string,
    userName: string,
    complaintId: string,
    status: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const whatsappMessage = this.generateComplaintUpdateMessage(userName, complaintId, status, message)
    
    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message: whatsappMessage,
      template: 'complaint_update'
    })
  }

  // Send welcome message via WhatsApp
  async sendWelcomeWhatsApp(phoneNumber: string, userName: string): Promise<{ success: boolean; error?: string }> {
    const message = `Hello ${userName}! 👋

Welcome to our Grievance Management System!

You can now:
📝 File new complaints
📊 Track complaint status
🔔 Receive real-time updates
📱 Get support via our chatbot

Thank you for choosing our service! 🎉`

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message,
      template: 'welcome'
    })
  }

  // Send complaint resolution via WhatsApp
  async sendResolutionWhatsApp(
    phoneNumber: string,
    userName: string,
    complaintId: string,
    resolution: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `🎉 Great news, ${userName}!

Your complaint (ID: ${complaintId}) has been successfully resolved!

Resolution: ${resolution}

Thank you for your patience. We hope this resolution meets your expectations! 🙏

View details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}`

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message,
      template: 'resolution'
    })
  }

  // Generate complaint update message
  private generateComplaintUpdateMessage(userName: string, complaintId: string, status: string, message?: string): string {
    let statusEmoji = '📋'
    switch (status.toLowerCase()) {
      case 'pending':
        statusEmoji = '⏳'
        break
      case 'under review':
        statusEmoji = '🔍'
        break
      case 'in progress':
        statusEmoji = '🚧'
        break
      case 'resolved':
        statusEmoji = '✅'
        break
      case 'closed':
        statusEmoji = '🔒'
        break
      case 'rejected':
        statusEmoji = '❌'
        break
    }

    return `Hello ${userName}! 📢

Your complaint has been updated:

🆔 Complaint ID: ${complaintId}
${statusEmoji} New Status: ${status}
${message ? `💬 Message: ${message}` : ''}

View full details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}

Thank you for using our service! 🙏`
  }

  // Send urgent notification via WhatsApp
  async sendUrgentNotification(
    phoneNumber: string,
    userName: string,
    complaintId: string,
    urgency: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `🚨 URGENT UPDATE - ${userName}!

Your complaint (ID: ${complaintId}) requires immediate attention!

Priority: ${urgency}

Please check your dashboard for more details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}

This is an automated urgent notification.`

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message,
      template: 'urgent'
    })
  }

  // Send reminder via WhatsApp
  async sendReminderWhatsApp(
    phoneNumber: string,
    userName: string,
    complaintId: string,
    daysPending: number
  ): Promise<{ success: boolean; error?: string }> {
    const message = `⏰ Reminder - ${userName}

Your complaint (ID: ${complaintId}) has been pending for ${daysPending} days.

We're working on it and will update you soon!

View status: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}

Thank you for your patience! 🙏`

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message,
      template: 'reminder'
    })
  }
}

export const whatsappService = new WhatsAppService() 