-- Fix Admin Login Issues - Comprehensive Solution
-- Run this script in your Supabase SQL Editor

-- Step 1: Ensure admin_users table exists with correct structure
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'department_admin')),
    department VARCHAR(255),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Step 2: Drop and recreate RLS policies for admin_users to fix permission issues
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to view admin_users" ON admin_users;

-- Create new, more permissive policies for debugging
CREATE POLICY "Allow authenticated users to view admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert admin_users" ON admin_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update admin_users" ON admin_users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Create a function to check if admin user exists
CREATE OR REPLACE FUNCTION check_admin_user(user_email TEXT)
RETURNS TABLE(
    user_exists BOOLEAN,
    user_id UUID,
    admin_id UUID,
    role TEXT,
    name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN au.id IS NOT NULL THEN true ELSE false END as user_exists,
        u.id as user_id,
        au.id as admin_id,
        au.role,
        au.name
    FROM auth.users u
    LEFT JOIN admin_users au ON u.id = au.user_id
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create a function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_name TEXT DEFAULT 'Admin User',
    admin_role TEXT DEFAULT 'admin',
    admin_department TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    admin_uuid UUID;
BEGIN
    -- Get user UUID from auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'Error: User not found in auth.users table. Please ensure the user has signed up first.';
    END IF;
    
    -- Check if admin user already exists
    IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = user_uuid) THEN
        RETURN 'Error: Admin user already exists for this email.';
    END IF;
    
    -- Create admin user
    INSERT INTO admin_users (user_id, name, email, role, department)
    VALUES (user_uuid, admin_name, admin_email, admin_role, admin_department)
    RETURNING id INTO admin_uuid;
    
    RETURN 'Success: Admin user created with ID: ' || admin_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create a function to list all admin users (for debugging)
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
    admin_id UUID,
    user_id UUID,
    name TEXT,
    email TEXT,
    role TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as admin_id,
        au.user_id,
        au.name,
        au.email,
        au.role,
        au.department,
        au.created_at
    FROM admin_users au
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create a function to delete admin user (for cleanup)
CREATE OR REPLACE FUNCTION delete_admin_user(admin_email TEXT)
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_users 
    WHERE email = admin_email;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RETURN 'Success: Admin user deleted.';
    ELSE
        RETURN 'Error: No admin user found with that email.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Step 9: Insert a test admin user (replace with your actual user email)
-- IMPORTANT: Replace 'your-email@example.com' with the actual email you used to sign up
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'your-email@example.com') THEN
--         PERFORM create_admin_user('your-email@example.com', 'Test Admin', 'super_admin', 'IT Department');
--     END IF;
-- END $$;

-- Step 10: Create a comprehensive check function
CREATE OR REPLACE FUNCTION debug_admin_setup()
RETURNS TABLE(
    check_item TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check if admin_users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        RETURN QUERY SELECT 'admin_users table'::TEXT, 'EXISTS'::TEXT, 'Table is present'::TEXT;
    ELSE
        RETURN QUERY SELECT 'admin_users table'::TEXT, 'MISSING'::TEXT, 'Table does not exist'::TEXT;
    END IF;
    
    -- Check RLS status
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_users' AND rowsecurity = true) THEN
        RETURN QUERY SELECT 'RLS enabled'::TEXT, 'YES'::TEXT, 'Row Level Security is active'::TEXT;
    ELSE
        RETURN QUERY SELECT 'RLS enabled'::TEXT, 'NO'::TEXT, 'Row Level Security is not active'::TEXT;
    END IF;
    
    -- Count users in auth.users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RETURN QUERY SELECT 'auth.users count'::TEXT, user_count::TEXT, 'Total users in auth.users'::TEXT;
    
    -- Count admin users
    SELECT COUNT(*) INTO admin_count FROM admin_users;
    RETURN QUERY SELECT 'admin_users count'::TEXT, admin_count::TEXT, 'Total admin users'::TEXT;
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'admin_users';
    RETURN QUERY SELECT 'RLS policies'::TEXT, policy_count::TEXT, 'Number of policies on admin_users'::TEXT;
    
    -- Check permissions
    IF EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE table_name = 'admin_users' AND grantee = 'authenticated') THEN
        RETURN QUERY SELECT 'authenticated permissions'::TEXT, 'GRANTED'::TEXT, 'Authenticated users have permissions'::TEXT;
    ELSE
        RETURN QUERY SELECT 'authenticated permissions'::TEXT, 'DENIED'::TEXT, 'Authenticated users lack permissions'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION check_admin_user(TEXT) IS 'Check if a user exists in admin_users table';
COMMENT ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT) IS 'Create a new admin user';
COMMENT ON FUNCTION list_admin_users() IS 'List all admin users for debugging';
COMMENT ON FUNCTION delete_admin_user(TEXT) IS 'Delete an admin user by email';
COMMENT ON FUNCTION debug_admin_setup() IS 'Comprehensive check of admin setup';

-- Final message
SELECT 'Admin login fix script completed successfully!' as message; 