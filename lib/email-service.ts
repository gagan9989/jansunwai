import { supabase } from "./supabase"

export interface EmailTemplate {
  subject: string
  body: string
  variables: Record<string, string>
}

class EmailService {
  // Send email using Supabase Edge Function (free tier)
  async sendEmail(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Using Supabase Edge Function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: htmlBody
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }
  }

  // Send complaint status update email
  async sendComplaintUpdateEmail(
    userEmail: string, 
    userName: string, 
    complaintId: string, 
    status: string, 
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Complaint Update - Status: ${status}`
    const htmlBody = this.generateComplaintUpdateEmail(userName, complaintId, status, message)
    
    return this.sendEmail(userEmail, subject, htmlBody)
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Welcome to Grievance Management System"
    const htmlBody = this.generateWelcomeEmail(userName)
    
    return this.sendEmail(userEmail, subject, htmlBody)
  }

  // Send complaint resolution email
  async sendResolutionEmail(
    userEmail: string, 
    userName: string, 
    complaintId: string, 
    resolution: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = "Your Complaint Has Been Resolved"
    const htmlBody = this.generateResolutionEmail(userName, complaintId, resolution)
    
    return this.sendEmail(userEmail, subject, htmlBody)
  }

  // Generate complaint update email HTML
  private generateComplaintUpdateEmail(userName: string, complaintId: string, status: string, message?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complaint Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .status { background: #10b981; color: white; padding: 10px; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Grievance Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your complaint has been updated with a new status.</p>
            
            <div style="margin: 20px 0;">
              <strong>Complaint ID:</strong> ${complaintId}<br>
              <strong>New Status:</strong> <span class="status">${status}</span>
            </div>
            
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            
            <p>You can view the full details of your complaint by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}" class="button">
                View Complaint Details
              </a>
            </div>
            
            <p>Thank you for using our grievance management system.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Grievance Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Generate welcome email HTML
  private generateWelcomeEmail(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Grievance Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Welcome to our Grievance Management System! We're excited to have you on board.</p>
            
            <h3>What you can do:</h3>
            <ul>
              <li>File new complaints and grievances</li>
              <li>Track the status of your complaints</li>
              <li>Receive real-time updates</li>
              <li>View complaint history</li>
              <li>Get support through our chatbot</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                Go to Dashboard
              </a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 Grievance Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Generate resolution email HTML
  private generateResolutionEmail(userName: string, complaintId: string, resolution: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complaint Resolved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Complaint Resolved!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Great news! Your complaint has been successfully resolved.</p>
            
            <div style="margin: 20px 0;">
              <strong>Complaint ID:</strong> ${complaintId}<br>
              <strong>Resolution:</strong> ${resolution}
            </div>
            
            <p>We appreciate your patience and hope this resolution meets your expectations.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/complaint/${complaintId}" class="button">
                View Details
              </a>
            </div>
            
            <p>Thank you for using our grievance management system.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Grievance Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const emailService = new EmailService() 