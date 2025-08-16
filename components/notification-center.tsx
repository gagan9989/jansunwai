"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings,
  Mail,
  MailOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { notificationService, type Notification } from "@/lib/notifications"
import { pushNotificationService } from "@/lib/push-notifications"
import { toast } from "@/hooks/use-toast"

interface NotificationCenterProps {
  userId: string
  className?: string
}

export function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const subscriptionRef = useRef<any>(null)

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await notificationService.getUserNotifications(userId)
      if (error) throw error
      setNotifications(data)
      
      // Update unread count
      const { count } = await notificationService.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time notifications
  const subscribeToNotifications = () => {
    if (subscriptionRef.current) {
      notificationService.unsubscribeFromNotifications(userId)
    }

    subscriptionRef.current = notificationService.subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show toast for new notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      })

      // Send push notification if enabled
      if (pushEnabled) {
        pushNotificationService.sendNotification({
          title: newNotification.title,
          body: newNotification.message,
          data: {
            url: newNotification.action_url || '/dashboard'
          }
        })
      }
    })
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { success, error } = await notificationService.markAsRead(notificationId)
      if (error) throw error
      
      if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { success, error } = await notificationService.markAllAsRead(userId)
      if (error) throw error
      
      if (success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { success, error } = await notificationService.deleteNotification(notificationId)
      if (error) throw error
      
      if (success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        // Update unread count if notification was unread
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Enable push notifications
  const enablePushNotifications = async () => {
    try {
      const { granted, error } = await pushNotificationService.requestPermission()
      if (error) throw error
      
      if (granted) {
        setPushEnabled(true)
        toast({
          title: "Success",
          description: "Push notifications enabled!",
        })
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      })
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string, category: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  useEffect(() => {
    loadNotifications()
    subscribeToNotifications()
    
    // Check push notification status
    setPushEnabled(pushNotificationService.isEnabled())

    return () => {
      if (subscriptionRef.current) {
        notificationService.unsubscribeFromNotifications(userId)
      }
    }
  }, [userId])

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 shadow-xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {!pushEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={enablePushNotifications}
                    className="h-8 w-8 p-0"
                    title="Enable push notifications"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 w-8 p-0"
                    title="Mark all as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                        getNotificationColor(notification.type),
                        !notification.is_read && "border-l-4 border-l-blue-500"
                      )}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                        if (notification.action_url && typeof window !== 'undefined') {
                          window.location.href = notification.action_url
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          {getNotificationIcon(notification.type, notification.category)}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.is_read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(notification.created_at)}
                              </span>
                              {notification.category && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 