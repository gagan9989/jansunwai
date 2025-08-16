import { supabase } from "./supabase"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'complaint_update' | 'status_change' | 'assignment' | 'resolution' | 'general'
  complaint_id?: string
  is_read: boolean
  created_at: string
  action_url?: string
}

export interface NotificationPreferences {
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  whatsapp_notifications: boolean
  push_notifications: boolean
  complaint_updates: boolean
  status_changes: boolean
  assignments: boolean
  general_announcements: boolean
}

class NotificationService {
  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification])

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50): Promise<{ data: Notification[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { data: [], error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return { count: count || 0 }
    } catch (error) {
      console.error('Error getting unread count:', error)
      return { count: 0, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId: string) {
    supabase.channel(`notifications:${userId}`).unsubscribe()
  }
}

export const notificationService = new NotificationService() 