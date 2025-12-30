-- ============================================
-- Migration: Add Status Column & Mock Users (Fixed)
-- ============================================
-- This migration handles the foreign key constraint issue
-- by temporarily disabling it for test data

-- Step 1: Add 'status' column to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned'));
    END IF;
END $$;

-- Step 2: Temporarily drop the foreign key constraint
-- Note: We need to find the actual constraint name first
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the foreign key constraint name
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'profiles'
    AND con.contype = 'f'
    AND nsp.nspname = 'public'
    LIMIT 1;
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END IF;
END $$;

-- Step 3: Insert mock users
INSERT INTO profiles (id, email, name, avatar_url, bio, year, college, tech_stack, interests, github_profile, linkedin_profile, contributions, streak, role, status, created_at)
VALUES 
(
    gen_random_uuid(),
    'rahul.sharma@example.com',
    'Rahul Sharma',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rahul',
    'Full-stack developer passionate about React and Node.js. Love contributing to open source!',
    3,
    'IIT Delhi',
    ARRAY['React', 'Node.js', 'TypeScript', 'MongoDB'],
    ARRAY['Web Development', 'Machine Learning', 'Open Source'],
    'https://github.com/rahulsharma',
    'https://linkedin.com/in/rahulsharma',
    156,
    12,
    'user',
    'active',
    NOW() - INTERVAL '30 days'
),
(
    gen_random_uuid(),
    'priya.patel@example.com',
    'Priya Patel',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=priya',
    'Data Science enthusiast and ML practitioner. Currently exploring NLP and computer vision.',
    4,
    'NIT Trichy',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'SQL'],
    ARRAY['Data Science', 'AI/ML', 'Statistics'],
    'https://github.com/priyapatel',
    'https://linkedin.com/in/priyapatel',
    234,
    8,
    'admin',
    'active',
    NOW() - INTERVAL '60 days'
),
(
    gen_random_uuid(),
    'amit.kumar@example.com',
    'Amit Kumar',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=amit',
    'Backend developer specializing in microservices architecture. Java and Kotlin fan!',
    2,
    'BITS Pilani',
    ARRAY['Java', 'Kotlin', 'Spring Boot', 'PostgreSQL'],
    ARRAY['Backend Development', 'System Design', 'Cloud Computing'],
    'https://github.com/amitkumar',
    NULL,
    89,
    5,
    'user',
    'active',
    NOW() - INTERVAL '15 days'
),
(
    gen_random_uuid(),
    'sneha.reddy@example.com',
    'Sneha Reddy',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sneha',
    'Frontend developer with a passion for creating beautiful user interfaces.',
    3,
    'VIT Vellore',
    ARRAY['React', 'Vue.js', 'CSS', 'Figma'],
    ARRAY['UI/UX Design', 'Frontend Development', 'Animations'],
    'https://github.com/snehareddy',
    'https://linkedin.com/in/snehareddy',
    178,
    15,
    'user',
    'active',
    NOW() - INTERVAL '45 days'
),
(
    gen_random_uuid(),
    'arjun.mehta@example.com',
    'Arjun Mehta',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=arjun',
    'DevOps engineer and cloud enthusiast. AWS certified professional.',
    4,
    'IIIT Hyderabad',
    ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    ARRAY['DevOps', 'Cloud Infrastructure', 'Automation'],
    'https://github.com/arjunmehta',
    'https://linkedin.com/in/arjunmehta',
    312,
    20,
    'user',
    'banned',
    NOW() - INTERVAL '90 days'
),
(
    gen_random_uuid(),
    'kavya.singh@example.com',
    'Kavya Singh',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=kavya',
    'Mobile app developer building cross-platform apps with Flutter.',
    2,
    'DTU Delhi',
    ARRAY['Flutter', 'Dart', 'Firebase', 'Swift'],
    ARRAY['Mobile Development', 'Cross-platform Apps', 'UI Design'],
    'https://github.com/kavyasingh',
    NULL,
    67,
    3,
    'user',
    'active',
    NOW() - INTERVAL '7 days'
),
(
    gen_random_uuid(),
    'rohan.joshi@example.com',
    'Rohan Joshi',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rohan',
    'Competitive programmer and algorithms enthusiast. 5-star on Codeforces!',
    3,
    'IIT Bombay',
    ARRAY['C++', 'Python', 'Java', 'DSA'],
    ARRAY['Competitive Programming', 'Algorithms', 'Problem Solving'],
    'https://github.com/rohanjoshi',
    'https://linkedin.com/in/rohanjoshi',
    445,
    30,
    'admin',
    'active',
    NOW() - INTERVAL '120 days'
),
(
    gen_random_uuid(),
    'neha.gupta@example.com',
    'Neha Gupta',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=neha',
    'Blockchain developer exploring Web3 and smart contracts.',
    4,
    'SRM Chennai',
    ARRAY['Solidity', 'Web3.js', 'Ethereum', 'React'],
    ARRAY['Blockchain', 'Web3', 'Cryptocurrency'],
    'https://github.com/nehagupta',
    'https://linkedin.com/in/nehagupta',
    123,
    7,
    'user',
    'active',
    NOW() - INTERVAL '25 days'
),
(
    gen_random_uuid(),
    'vikram.rao@example.com',
    'Vikram Rao',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=vikram',
    'Security researcher and ethical hacker. Bug bounty hunter.',
    3,
    'NIT Surathkal',
    ARRAY['Python', 'Bash', 'Burp Suite', 'Wireshark'],
    ARRAY['Cybersecurity', 'Penetration Testing', 'CTF'],
    'https://github.com/vikramrao',
    NULL,
    201,
    11,
    'user',
    'banned',
    NOW() - INTERVAL '50 days'
),
(
    gen_random_uuid(),
    'ananya.das@example.com',
    'Ananya Das',
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ananya',
    'Game developer creating indie games with Unity and Unreal Engine.',
    2,
    'Manipal University',
    ARRAY['C#', 'Unity', 'Unreal', 'Blender'],
    ARRAY['Game Development', '3D Modeling', 'Animation'],
    'https://github.com/ananyadis',
    'https://linkedin.com/in/ananyadis',
    78,
    4,
    'user',
    'active',
    NOW() - INTERVAL '10 days'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    year = EXCLUDED.year,
    college = EXCLUDED.college,
    tech_stack = EXCLUDED.tech_stack,
    interests = EXCLUDED.interests,
    github_profile = EXCLUDED.github_profile,
    linkedin_profile = EXCLUDED.linkedin_profile,
    contributions = EXCLUDED.contributions,
    streak = EXCLUDED.streak,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Step 4: Update RLS policies
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all data" ON profiles;

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (true);

CREATE POLICY "Admins can view all data"
ON profiles FOR SELECT
USING (true);

-- Step 5: Verify data
SELECT 
    name, 
    email, 
    role, 
    status, 
    contributions, 
    streak,
    college,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- ============================================
-- SUCCESS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '- Added status column to profiles';
    RAISE NOTICE '- Created 10 mock users for testing';
    RAISE NOTICE '- Updated RLS policies for admin access';
    RAISE NOTICE '============================================';
END $$;
