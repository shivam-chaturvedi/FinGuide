-- Comprehensive fix for lessons and modules schema
-- This migration ensures all tables are properly structured

-- First, ensure the lessons table has all required columns
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
    duration_minutes INTEGER DEFAULT 5,
    video_url TEXT,
    text_content TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Ensure modules table has all required columns
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'basics' CHECK (category IN ('basics', 'management', 'remittance', 'advanced')),
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not-started' CHECK (status IN ('completed', 'in-progress', 'locked', 'not-started')),
ADD COLUMN IF NOT EXISTS price TEXT DEFAULT 'Free' CHECK (price IN ('Free', 'Premium')),
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS what_youll_learn TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quiz_score INTEGER,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_quiz_id ON public.lessons(quiz_id);
CREATE INDEX IF NOT EXISTS idx_modules_quiz_id ON public.modules(quiz_id);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons
DROP POLICY IF EXISTS "Users can read published lessons" ON public.lessons;
CREATE POLICY "Users can read published lessons" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.modules 
            WHERE id = module_id AND is_published = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage all lessons" ON public.lessons;
CREATE POLICY "Admins can manage all lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';




