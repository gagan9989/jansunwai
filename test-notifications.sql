-- Test Notifications System
-- Run these commands one by one in your Supabase SQL Editor

-- 1. First, check if notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) as notifications_table_exists;

-- 2. Check if notification functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%notification%';

-- 3. Test creating a notification (replace 'your-user-id' with actual user ID)
-- First, get a user ID from your auth.users table:
SELECT id, email FROM auth.users LIMIT 1;

-- 4. Create a test notification (replace 'actual-user-id' with the ID from step 3)
SELECT create_notification(
    'actual-user-id',  -- Replace with actual user ID
    'Test Notification',
    'This is a test notification to verify the system is working.',
    'info',
    'general',
    NULL,
    '/dashboard'
);

-- 5. Test sending reminders for pending complaints
SELECT test_send_reminders();

-- 6. Check if notifications were created
SELECT 
    id,
    title,
    message,
    type,
    category,
    is_read,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Test getting unread count for a user
SELECT 
    user_id,
    COUNT(*) as unread_count
FROM notifications 
WHERE user_id = 'actual-user-id'  -- Replace with actual user ID
AND is_read = false
GROUP BY user_id;

-- 8. Test marking notification as read
-- First, get a notification ID:
SELECT id FROM notifications WHERE user_id = 'actual-user-id' LIMIT 1;

-- Then mark it as read (replace 'notification-id' with actual ID):
UPDATE notifications 
SET is_read = true 
WHERE id = 'notification-id';  -- Replace with actual notification ID

-- 9. Test notification preferences
SELECT * FROM notification_preferences WHERE user_id = 'actual-user-id';

-- 10. Test updating notification preferences
SELECT update_notification_preferences(
    'actual-user-id',  -- Replace with actual user ID
    true,   -- email_notifications
    false,  -- sms_notifications
    false,  -- whatsapp_notifications
    true,   -- push_notifications
    true,   -- complaint_updates
    true,   -- status_changes
    true,   -- assignments
    true    -- general_announcements
);

-- 11. Test complaint status notification trigger
-- First, get a complaint ID:
SELECT id, user_id, registration_number FROM complaints LIMIT 1;

-- Then update its status to trigger notification (replace with actual IDs):
UPDATE complaints 
SET status_id = 2  -- Change to "Under Review"
WHERE id = 1;  -- Replace with actual complaint ID

-- 12. Check if trigger created notification
SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.category,
    n.created_at
FROM notifications n
WHERE n.complaint_id = '1'  -- Replace with actual complaint ID
ORDER BY n.created_at DESC;

-- 13. Test bulk notification (system announcement)
-- This will send to all users
SELECT send_system_announcement(
    'System Maintenance Notice',
    'The system will be under maintenance from 2-4 AM tonight. Please plan accordingly.',
    'warning'
);

-- 14. Clean up test data (optional)
-- DELETE FROM notifications WHERE title LIKE 'Test%';
-- DELETE FROM notifications WHERE title LIKE 'System Maintenance%';

-- 15. Final verification - check all notifications
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
    COUNT(CASE WHEN type = 'info' THEN 1 END) as info_notifications,
    COUNT(CASE WHEN type = 'success' THEN 1 END) as success_notifications,
    COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_notifications,
    COUNT(CASE WHEN type = 'error' THEN 1 END) as error_notifications
FROM notifications; 