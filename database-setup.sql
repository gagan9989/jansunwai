-- Database setup for Grievance Management System with Admin functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
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

-- Create complaint_categories table
CREATE TABLE IF NOT EXISTS complaint_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create complaint_subcategories table
CREATE TABLE IF NOT EXISTS complaint_subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES complaint_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Create complaint_statuses table
CREATE TABLE IF NOT EXISTS complaint_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(50) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    category_id INTEGER REFERENCES complaint_categories(id),
    subcategory_id INTEGER REFERENCES complaint_subcategories(id),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    complaint_house_no VARCHAR(100),
    complaint_area_address TEXT,
    complaint_zone_ward_no VARCHAR(50),
    complaint_city VARCHAR(100) NOT NULL,
    complaint_area VARCHAR(100),
    complaint_pincode VARCHAR(10) NOT NULL,
    complainant_first_name VARCHAR(100) NOT NULL,
    complainant_middle_name VARCHAR(100),
    complainant_last_name VARCHAR(100) NOT NULL,
    complainant_house_no VARCHAR(100),
    complainant_area_address TEXT,
    complainant_zone_ward_no VARCHAR(50),
    complainant_landmark VARCHAR(200),
    complainant_state VARCHAR(100),
    complainant_pincode VARCHAR(10),
    complainant_country VARCHAR(100) NOT NULL DEFAULT 'India',
    telephone_off VARCHAR(20),
    mobile_number VARCHAR(15) NOT NULL,
    telephone_res VARCHAR(20),
    email_address VARCHAR(255) NOT NULL,
    status_id INTEGER REFERENCES complaint_statuses(id) DEFAULT 1,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES admin_users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attachments TEXT[]
);

-- Create complaint_responses table
CREATE TABLE IF NOT EXISTS complaint_responses (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    responded_by UUID REFERENCES auth.users(id),
    response TEXT NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    aadhaar_number VARCHAR(12),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default complaint statuses
INSERT INTO complaint_statuses (id, name, description, color) VALUES
(1, 'Pending', 'Complaint is pending review', '#F59E0B'),
(2, 'Under Review', 'Complaint is being reviewed', '#3B82F6'),
(3, 'In Progress', 'Work is in progress', '#8B5CF6'),
(4, 'Resolved', 'Complaint has been resolved', '#10B981'),
(5, 'Closed', 'Complaint has been closed', '#6B7280'),
(6, 'Rejected', 'Complaint has been rejected', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Insert default complaint categories
INSERT INTO complaint_categories (name, description) VALUES
('Water Supply', 'Issues related to water supply and distribution'),
('Roads & Transportation', 'Road maintenance, traffic, and transportation issues'),
('Sanitation & Waste Management', 'Garbage collection, drainage, and sanitation issues'),
('Street Lighting', 'Street light maintenance and installation'),
('Public Health', 'Health-related complaints and concerns'),
('Education', 'Educational institution related issues'),
('Public Safety', 'Safety and security related complaints'),
('Environment', 'Environmental issues and pollution'),
('Housing', 'Housing and property related issues'),
('Other', 'Other miscellaneous complaints')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Water Supply
INSERT INTO complaint_subcategories (category_id, name) VALUES
(1, 'No Water Supply'),
(1, 'Low Water Pressure'),
(1, 'Water Quality Issues'),
(1, 'Water Leakage'),
(1, 'Water Tank Maintenance')
ON CONFLICT DO NOTHING;

-- Insert subcategories for Roads & Transportation
INSERT INTO complaint_subcategories (category_id, name) VALUES
(2, 'Potholes'),
(2, 'Road Construction'),
(2, 'Traffic Signals'),
(2, 'Street Signs'),
(2, 'Public Transport')
ON CONFLICT DO NOTHING;

-- Insert subcategories for Sanitation & Waste Management
INSERT INTO complaint_subcategories (category_id, name) VALUES
(3, 'Garbage Collection'),
(3, 'Drainage Issues'),
(3, 'Sewage Problems'),
(3, 'Public Toilets'),
(3, 'Waste Disposal')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status_id ON complaints(status_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_registration_number ON complaints(registration_number);
CREATE INDEX IF NOT EXISTS idx_complaint_responses_complaint_id ON complaint_responses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Create function to generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.registration_number := 'GRV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEW.id::text, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate registration number
CREATE TRIGGER trigger_generate_registration_number
    BEFORE INSERT ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION generate_registration_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_complaint_categories_updated_at
    BEFORE UPDATE ON complaint_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_complaint_statuses_updated_at
    BEFORE UPDATE ON complaint_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for complaints - users can only see their own complaints, admins can see all
CREATE POLICY "Users can view own complaints" ON complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints" ON complaints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Policy for complaint responses
CREATE POLICY "Users can view responses to their complaints" ON complaint_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM complaints 
            WHERE complaints.id = complaint_responses.complaint_id 
            AND complaints.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all responses" ON complaint_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Policy for admin_users
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin')
        )
    );

-- Policy for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-attachments', 'complaint-attachments', true)
ON CONFLICT DO NOTHING;

-- Storage policy for complaint attachments
CREATE POLICY "Users can upload attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'complaint-attachments');

CREATE POLICY "Users can view attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'complaint-attachments');

-- Comments for documentation
COMMENT ON TABLE complaints IS 'Main complaints table storing all grievance information';
COMMENT ON TABLE complaint_categories IS 'Categories for organizing complaints';
COMMENT ON TABLE complaint_statuses IS 'Status definitions for complaint lifecycle';
COMMENT ON TABLE admin_users IS 'Admin users with different roles and permissions';
COMMENT ON TABLE complaint_responses IS 'Responses and updates to complaints';
COMMENT ON TABLE profiles IS 'User profile information'; 