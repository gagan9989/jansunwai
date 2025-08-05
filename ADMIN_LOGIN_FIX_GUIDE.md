# 🔧 Admin Login Fix Guide

## 🚨 Problem
The admin login is failing with a 500 Internal Server Error when querying the `admin_users` table. This is likely due to:
1. Missing or incorrect RLS (Row Level Security) policies
2. Missing admin user record
3. Permission issues
4. Database setup problems

## ✅ Solution Steps

### Step 1: Run the Fix Script
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `fix-admin-login.sql`
4. Click **Run** to execute the script

### Step 2: Check Your Current Setup
After running the fix script, run this diagnostic query:

```sql
SELECT * FROM debug_admin_setup();
```

This will show you:
- ✅ If the `admin_users` table exists
- ✅ RLS status
- ✅ Number of users in `auth.users`
- ✅ Number of admin users
- ✅ RLS policies count
- ✅ Permission status

### Step 3: Check Your User in auth.users
Run this query to see if your user exists:

```sql
SELECT id, email, created_at FROM auth.users WHERE email = 'your-email@example.com';
```

Replace `'your-email@example.com'` with the email you used to sign up.

### Step 4: Create Admin User
If your user exists in `auth.users` but not in `admin_users`, run:

```sql
SELECT create_admin_user('your-email@example.com', 'Your Name', 'super_admin', 'IT Department');
```

Replace:
- `'your-email@example.com'` with your actual email
- `'Your Name'` with your actual name
- `'super_admin'` with desired role (admin, super_admin, department_admin)
- `'IT Department'` with your department (optional)

### Step 5: Verify Admin User Creation
Check if the admin user was created successfully:

```sql
SELECT * FROM list_admin_users();
```

### Step 6: Test Admin Login
1. Go to your application
2. Navigate to `/admin/signin`
3. Try logging in with your credentials
4. Check the browser console for debug logs

## 🔍 Debugging Commands

### Check if admin user exists for your email:
```sql
SELECT * FROM check_admin_user('your-email@example.com');
-- This will return: user_exists, user_id, admin_id, role, name
```

### List all admin users:
```sql
SELECT * FROM list_admin_users();
```

### Check RLS policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';
```

### Check table permissions:
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'admin_users';
```

## 🚨 Common Issues & Solutions

### Issue 1: "User not found in auth.users"
**Solution:** Make sure you've signed up first using the regular signup page before creating an admin user.

### Issue 2: "Admin user already exists"
**Solution:** The user is already an admin. Try logging in directly.

### Issue 3: "Permission denied"
**Solution:** Run the fix script again to ensure proper permissions.

### Issue 4: "500 Internal Server Error"
**Solution:** This usually means RLS policies are blocking the query. The fix script creates more permissive policies.

## 🧪 Testing the Fix

### Test 1: Check Database Setup
```sql
SELECT * FROM debug_admin_setup();
```

### Test 2: Check Your User
```sql
SELECT * FROM check_admin_user('your-email@example.com');
```

### Test 3: Try Admin Login
1. Open browser console (F12)
2. Go to `/admin/signin`
3. Enter credentials
4. Check console logs for debug information

## 📋 Complete Fix Checklist

- [ ] Run `fix-admin-login.sql` script
- [ ] Check `debug_admin_setup()` results
- [ ] Verify user exists in `auth.users`
- [ ] Create admin user if needed
- [ ] Verify admin user in `admin_users`
- [ ] Test admin login
- [ ] Check browser console for errors

## 🔧 Manual Admin User Creation

If the functions don't work, you can manually create an admin user:

```sql
-- First, get your user ID from auth.users
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert into admin_users (replace USER_ID_HERE with the actual UUID)
INSERT INTO admin_users (user_id, name, email, role, department)
VALUES (
    'USER_ID_HERE', 
    'Your Name', 
    'your-email@example.com', 
    'super_admin', 
    'IT Department'
);
```

## 📞 Support

If you're still having issues after following this guide:

1. Run `SELECT * FROM debug_admin_setup();` and share the results
2. Check browser console logs and share any errors
3. Verify your Supabase project settings
4. Ensure your environment variables are correct

## 🎯 Expected Result

After following these steps, you should be able to:
1. ✅ Log in to the admin portal at `/admin/signin`
2. ✅ Access the admin dashboard at `/admin/dashboard`
3. ✅ See debug logs in the browser console showing successful authentication
4. ✅ View and manage complaints in the admin interface 