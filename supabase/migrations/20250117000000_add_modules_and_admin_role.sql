-- Add admin role to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- in minutes
    file_url TEXT, -- URL to uploaded file
    file_name TEXT,
    file_size INTEGER, -- in bytes
    file_type TEXT, -- MIME type
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_category ON public.modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_difficulty ON public.modules(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_created_by ON public.modules(created_by);

-- Enable RLS (Row Level Security)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create policies for modules table
-- Users can read published modules
CREATE POLICY "Users can read published modules" ON public.modules
    FOR SELECT USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all modules" ON public.modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for modules table
CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON public.modules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user profile (you'll need to replace with actual admin user ID)
-- This is a placeholder - you should replace 'admin-user-id' with the actual UUID from auth.users
-- INSERT INTO public.user_profiles (user_id, full_name, role) 
-- VALUES ('admin-user-id', 'Admin User', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

