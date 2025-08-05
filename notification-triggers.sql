-- Automatic Notification Triggers
-- Run this script in your Supabase SQL Editor

-- Create trigger function for complaint status changes
CREATE OR REPLACE FUNCTION trigger_complaint_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status actually changed
    IF OLD.status_id != NEW.status_id THEN
        -- Get status name
        DECLARE
            status_name TEXT;
        BEGIN
            SELECT name INTO status_name 
            FROM complaint_statuses 
            WHERE id = NEW.status_id;
            
            -- Create notification automatically
            PERFORM create_notification(
                NEW.user_id,
                'Complaint Status Updated',
                'Your complaint (ID: ' || NEW.registration_number || ') status has been updated to: ' || status_name,
                'info',
                'status_change',
                NEW.id,
                '/dashboard/complaint/' || NEW.id
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint status updates
DROP TRIGGER IF EXISTS complaint_status_notification_trigger ON complaints;
CREATE TRIGGER complaint_status_notification_trigger
    AFTER UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION trigger_complaint_status_notification();

-- Create trigger function for new complaint assignments
CREATE OR REPLACE FUNCTION trigger_complaint_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger when complaint is assigned to admin
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        -- Create notification for user
        PERFORM create_notification(
            NEW.user_id,
            'Complaint Assigned',
            'Your complaint (ID: ' || NEW.registration_number || ') has been assigned to a department for review.',
            'info',
            'assignment',
            NEW.id,
            '/dashboard/complaint/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint assignments
DROP TRIGGER IF EXISTS complaint_assignment_notification_trigger ON complaints;
CREATE TRIGGER complaint_assignment_notification_trigger
    AFTER UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION trigger_complaint_assignment_notification();

-- Create trigger function for complaint responses
CREATE OR REPLACE FUNCTION trigger_complaint_response_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger when admin adds a response
    PERFORM create_notification(
        (SELECT user_id FROM complaints WHERE id = NEW.complaint_id),
        'New Response Added',
        'A new response has been added to your complaint (ID: ' || 
        (SELECT registration_number FROM complaints WHERE id = NEW.complaint_id) || ').',
        'info',
        'complaint_update',
        NEW.complaint_id,
        '/dashboard/complaint/' || NEW.complaint_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint responses
DROP TRIGGER IF EXISTS complaint_response_notification_trigger ON complaint_responses;
CREATE TRIGGER complaint_response_notification_trigger
    AFTER INSERT ON complaint_responses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_complaint_response_notification();

-- Create trigger function for complaint resolution
CREATE OR REPLACE FUNCTION trigger_complaint_resolution_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger when complaint is marked as resolved
    IF NEW.status_id = (SELECT id FROM complaint_statuses WHERE name = 'Resolved') THEN
        PERFORM create_notification(
            NEW.user_id,
            '🎉 Complaint Resolved!',
            'Great news! Your complaint (ID: ' || NEW.registration_number || ') has been successfully resolved.',
            'success',
            'resolution',
            NEW.id,
            '/dashboard/complaint/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint resolution
DROP TRIGGER IF EXISTS complaint_resolution_notification_trigger ON complaints;
CREATE TRIGGER complaint_resolution_notification_trigger
    AFTER UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION trigger_complaint_resolution_notification();

-- Create trigger function for new user registration
CREATE OR REPLACE FUNCTION trigger_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Send welcome notification to new users
    PERFORM create_notification(
        NEW.id,
        'Welcome to Grievance Management System!',
        'Thank you for registering! You can now file complaints and track their status.',
        'success',
        'general',
        NULL,
        '/dashboard'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS welcome_notification_trigger ON auth.users;
CREATE TRIGGER welcome_notification_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_welcome_notification();

-- Create function to send reminder notifications for pending complaints
CREATE OR REPLACE FUNCTION send_pending_reminders()
RETURNS void AS $$
DECLARE
    complaint_record RECORD;
BEGIN
    -- Find complaints pending for more than 3 days
    FOR complaint_record IN 
        SELECT 
            c.id,
            c.user_id,
            c.registration_number,
            c.created_at,
            EXTRACT(DAY FROM NOW() - c.created_at) as days_pending
        FROM complaints c
        WHERE c.status_id = (SELECT id FROM complaint_statuses WHERE name = 'Pending')
        AND c.created_at < NOW() - INTERVAL '3 days'
        AND c.created_at > NOW() - INTERVAL '30 days' -- Don't send reminders for very old complaints
    LOOP
        -- Send reminder notification
        PERFORM create_notification(
            complaint_record.user_id,
            '⏰ Complaint Reminder',
            'Your complaint (ID: ' || complaint_record.registration_number || ') has been pending for ' || 
            complaint_record.days_pending || ' days. We are working on it!',
            'warning',
            'general',
            complaint_record.id,
            '/dashboard/complaint/' || complaint_record.id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to send reminders (runs daily)
-- Note: This requires pg_cron extension which may not be available in free tier
-- You can run this manually or set up a cron job

-- Function to manually send reminders (for testing)
CREATE OR REPLACE FUNCTION test_send_reminders()
RETURNS TEXT AS $$
BEGIN
    PERFORM send_pending_reminders();
    RETURN 'Reminders sent successfully!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION trigger_complaint_status_notification() IS 'Automatically sends notification when complaint status changes';
COMMENT ON FUNCTION trigger_complaint_assignment_notification() IS 'Automatically sends notification when complaint is assigned';
COMMENT ON FUNCTION trigger_complaint_response_notification() IS 'Automatically sends notification when admin adds response';
COMMENT ON FUNCTION trigger_complaint_resolution_notification() IS 'Automatically sends notification when complaint is resolved';
COMMENT ON FUNCTION trigger_welcome_notification() IS 'Automatically sends welcome notification to new users';
COMMENT ON FUNCTION send_pending_reminders() IS 'Sends reminder notifications for pending complaints';

-- Final message
SELECT 'Notification triggers setup completed successfully!' as message; 