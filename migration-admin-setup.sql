-- =====================================================
-- ADMIN USER SETUP FOR LEARNHUB
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create the admin user via Supabase Auth
-- Go to Supabase Dashboard > Authentication > Users > Invite user
-- Email: admin@learnhub.dev
-- Password: LearnHub@Admin2024

-- Step 2: Add role column to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 3: After creating the admin user via dashboard, run this to set admin role
-- Replace 'YOUR_ADMIN_USER_ID' with the actual user ID from Auth Users table
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_USER_ID';

-- Step 4: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create policy to allow admins to view all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin(auth.uid())
  );

-- Step 6: Create policy to allow admins to update profiles
CREATE POLICY IF NOT EXISTS "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR is_admin(auth.uid())
  );

-- =====================================================
-- MANUAL STEPS:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Invite user" or "Add user"
-- 3. Enter: admin@learnhub.dev with password: LearnHub@Admin2024
-- 4. Copy the user ID after creation
-- 5. Run: UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';
-- =====================================================
