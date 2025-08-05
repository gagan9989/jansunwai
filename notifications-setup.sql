-- Notifications System Setup
-- Run this script in your Supabase SQL Editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('complaint_update', 'status_change', 'assignment', 'resolution', 'general')),
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    whatsapp_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    complaint_updates BOOLEAN DEFAULT TRUE,
    status_changes BOOLEAN DEFAULT TRUE,
    assignments BOOLEAN DEFAULT TRUE,
    general_announcements BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_category TEXT DEFAULT 'general',
    p_complaint_id INTEGER DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        category, 
        complaint_id, 
        action_url
    ) VALUES (
        p_user_id, 
        p_title, 
        p_message, 
        p_type, 
        p_category, 
        p_complaint_id, 
        p_action_url
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID)
RETURNS TABLE(
    email_notifications BOOLEAN,
    sms_notifications BOOLEAN,
    whatsapp_notifications BOOLEAN,
    push_notifications BOOLEAN,
    complaint_updates BOOLEAN,
    status_changes BOOLEAN,
    assignments BOOLEAN,
    general_announcements BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        np.email_notifications,
        np.sms_notifications,
        np.whatsapp_notifications,
        np.push_notifications,
        np.complaint_updates,
        np.status_changes,
        np.assignments,
        np.general_announcements
    FROM notification_preferences np
    WHERE np.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
    p_user_id UUID,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_sms_notifications BOOLEAN DEFAULT NULL,
    p_whatsapp_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_complaint_updates BOOLEAN DEFAULT NULL,
    p_status_changes BOOLEAN DEFAULT NULL,
    p_assignments BOOLEAN DEFAULT NULL,
    p_general_announcements BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO notification_preferences (
        user_id,
        email_notifications,
        sms_notifications,
        whatsapp_notifications,
        push_notifications,
        complaint_updates,
        status_changes,
        assignments,
        general_announcements
    ) VALUES (
        p_user_id,
        COALESCE(p_email_notifications, TRUE),
        COALESCE(p_sms_notifications, FALSE),
        COALESCE(p_whatsapp_notifications, FALSE),
        COALESCE(p_push_notifications, TRUE),
        COALESCE(p_complaint_updates, TRUE),
        COALESCE(p_status_changes, TRUE),
        COALESCE(p_assignments, TRUE),
        COALESCE(p_general_announcements, TRUE)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email_notifications = COALESCE(p_email_notifications, notification_preferences.email_notifications),
        sms_notifications = COALESCE(p_sms_notifications, notification_preferences.sms_notifications),
        whatsapp_notifications = COALESCE(p_whatsapp_notifications, notification_preferences.whatsapp_notifications),
        push_notifications = COALESCE(p_push_notifications, notification_preferences.push_notifications),
        complaint_updates = COALESCE(p_complaint_updates, notification_preferences.complaint_updates),
        status_changes = COALESCE(p_status_changes, notification_preferences.status_changes),
        assignments = COALESCE(p_assignments, notification_preferences.assignments),
        general_announcements = COALESCE(p_general_announcements, notification_preferences.general_announcements),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

DROP TRIGGER IF EXISTS trigger_update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to send complaint status update notifications
CREATE OR REPLACE FUNCTION send_complaint_status_notification(
    p_complaint_id INTEGER,
    p_status TEXT,
    p_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    complaint_record RECORD;
    notification_id UUID;
BEGIN
    -- Get complaint details
    SELECT 
        c.id,
        c.user_id,
        c.registration_number,
        c.subject,
        u.email,
        p.name as user_name,
        p.phone
    INTO complaint_record
    FROM complaints c
    JOIN auth.users u ON c.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.id
    WHERE c.id = p_complaint_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Create notification
    SELECT create_notification(
        complaint_record.user_id,
        'Complaint Status Update',
        COALESCE(p_message, 'Your complaint status has been updated to ' || p_status),
        'info',
        'status_change',
        p_complaint_id,
        '/dashboard/complaint/' || p_complaint_id
    ) INTO notification_id;
    
    -- TODO: Send email, SMS, WhatsApp notifications based on user preferences
    -- This would be handled by Edge Functions or external services
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for complaint updates and system messages';
COMMENT ON TABLE notification_preferences IS 'User preferences for different types of notifications';
COMMENT ON FUNCTION create_notification IS 'Create a new notification for a user';
COMMENT ON FUNCTION get_user_notification_preferences IS 'Get notification preferences for a user';
COMMENT ON FUNCTION update_notification_preferences IS 'Update notification preferences for a user';
COMMENT ON FUNCTION send_complaint_status_notification IS 'Send notification when complaint status changes';

-- Final message
SELECT 'Notifications system setup completed successfully!' as message; 