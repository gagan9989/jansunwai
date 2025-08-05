export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class PushNotificationService {
  private isSupported: boolean
  private permission: NotificationPermission = 'default'

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
  }

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return this.isSupported
  }

  // Request permission for push notifications
  async requestPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!this.isSupported) {
      return { granted: false, error: 'Push notifications are not supported in this browser' }
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      
      if (permission === 'granted') {
        // Register service worker for push notifications
        await this.registerServiceWorker()
        return { granted: true }
      } else {
        return { granted: false, error: 'Permission denied by user' }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return { granted: false, error: error.message }
    }
  }

  // Register service worker for push notifications
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Send local push notification
  async sendNotification(notification: PushNotification): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported) {
      return { success: false, error: 'Push notifications are not supported' }
    }

    if (this.permission !== 'granted') {
      return { success: false, error: 'Notification permission not granted' }
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/government-logo.jpg',
        badge: notification.badge || '/government-logo.jpg',
        image: notification.image,
        tag: notification.tag,
        data: notification.data,
        actions: notification.actions,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false
      }

      const notif = new Notification(notification.title, notificationOptions)

      // Handle notification click
      notif.onclick = (event) => {
        event.preventDefault()
        notif.close()
        
        // Focus on the app window
        window.focus()
        
        // Navigate to specific page if data contains URL
        if (notification.data?.url) {
          window.location.href = notification.data.url
        }
      }

      // Handle notification action clicks
      notif.onactionclick = (event) => {
        const action = event.action
        if (action === 'view') {
          window.focus()
          if (notification.data?.url) {
            window.location.href = notification.data.url
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Send complaint status update notification
  async sendComplaintUpdateNotification(
    complaintId: string,
    status: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const notification: PushNotification = {
      title: `Complaint Update - ${status}`,
      body: message || `Your complaint (ID: ${complaintId}) status has been updated to ${status}`,
      icon: '/government-logo.jpg',
      tag: `complaint-${complaintId}`,
      data: {
        url: `/dashboard/complaint/${complaintId}`,
        complaintId,
        status
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    }

    return this.sendNotification(notification)
  }

  // Send welcome notification
  async sendWelcomeNotification(userName: string): Promise<{ success: boolean; error?: string }> {
    const notification: PushNotification = {
      title: 'Welcome to Grievance Management System!',
      body: `Hello ${userName}! You can now file complaints and track their status.`,
      icon: '/government-logo.jpg',
      data: {
        url: '/dashboard'
      },
      actions: [
        {
          action: 'view',
          title: 'Go to Dashboard'
        }
      ]
    }

    return this.sendNotification(notification)
  }

  // Send resolution notification
  async sendResolutionNotification(
    complaintId: string,
    resolution: string
  ): Promise<{ success: boolean; error?: string }> {
    const notification: PushNotification = {
      title: '🎉 Complaint Resolved!',
      body: `Your complaint (ID: ${complaintId}) has been successfully resolved.`,
      icon: '/government-logo.jpg',
      tag: `complaint-${complaintId}`,
      data: {
        url: `/dashboard/complaint/${complaintId}`,
        complaintId,
        resolution
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    }

    return this.sendNotification(notification)
  }

  // Send urgent notification
  async sendUrgentNotification(
    complaintId: string,
    urgency: string
  ): Promise<{ success: boolean; error?: string }> {
    const notification: PushNotification = {
      title: '🚨 Urgent Update Required',
      body: `Your complaint (ID: ${complaintId}) requires immediate attention. Priority: ${urgency}`,
      icon: '/government-logo.jpg',
      tag: `urgent-${complaintId}`,
      data: {
        url: `/dashboard/complaint/${complaintId}`,
        complaintId,
        urgency
      },
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Now'
        }
      ]
    }

    return this.sendNotification(notification)
  }

  // Send reminder notification
  async sendReminderNotification(
    complaintId: string,
    daysPending: number
  ): Promise<{ success: boolean; error?: string }> {
    const notification: PushNotification = {
      title: '⏰ Complaint Reminder',
      body: `Your complaint (ID: ${complaintId}) has been pending for ${daysPending} days. We're working on it!`,
      icon: '/government-logo.jpg',
      tag: `reminder-${complaintId}`,
      data: {
        url: `/dashboard/complaint/${complaintId}`,
        complaintId,
        daysPending
      },
      actions: [
        {
          action: 'view',
          title: 'Check Status'
        }
      ]
    }

    return this.sendNotification(notification)
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted'
  }
}

export const pushNotificationService = new PushNotificationService() 