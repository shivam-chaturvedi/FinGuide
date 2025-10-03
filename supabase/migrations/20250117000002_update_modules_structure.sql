-- Update modules table to match the UI structure
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
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
    duration_minutes INTEGER DEFAULT 5,
    content JSONB, -- Store video URLs, text content, quiz questions
    is_completed BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user module progress table
CREATE TABLE IF NOT EXISTS public.user_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'not-started' CHECK (status IN ('completed', 'in-progress', 'locked', 'not-started')),
    quiz_score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Create user lesson progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    quiz_answers JSONB, -- Store quiz answers
    quiz_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON public.user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- Enable RLS for new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons table
CREATE POLICY "Users can read published lessons" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.modules 
            WHERE id = module_id AND is_published = true
        )
    );

CREATE POLICY "Admins can manage all lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for user_module_progress table
CREATE POLICY "Users can manage their own module progress" ON public.user_module_progress
    FOR ALL USING (user_id = auth.uid());

-- Create policies for user_lesson_progress table
CREATE POLICY "Users can manage their own lesson progress" ON public.user_lesson_progress
    FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_module_progress_updated_at 
    BEFORE UPDATE ON public.user_module_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at 
    BEFORE UPDATE ON public.user_lesson_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.modules (
    title, description, content, category, difficulty_level, level, 
    duration_weeks, estimated_duration, rating, price, thumbnail,
    what_youll_learn, prerequisites, is_published, created_by
) VALUES (
    'Financial Basics for Migrant Workers',
    'Master the fundamentals of personal finance, budgeting, and money management specifically designed for migrant workers in Singapore.',
    'This comprehensive course covers all the essential financial knowledge every migrant worker needs to succeed in Singapore.',
    'basics',
    'beginner',
    'Beginner',
    4,
    240,
    4.8,
    'Free',
    'Financial Basics',
    ARRAY[
        'Understand Singapore''s financial system',
        'Create and maintain a personal budget',
        'Learn about banking and savings accounts',
        'Understand basic investment concepts'
    ],
    ARRAY['Basic English', 'Singapore work permit'],
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Insert sample lessons for the first module
INSERT INTO public.lessons (module_id, title, type, duration_minutes, content, order_index)
SELECT 
    m.id,
    'Welcome to Financial Literacy',
    'video',
    5,
    '{"videoUrl": "https://example.com/video1", "textContent": "Introduction to financial literacy for migrant workers"}',
    1
FROM public.modules m 
WHERE m.title = 'Financial Basics for Migrant Workers'
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (module_id, title, type, duration_minutes, content, order_index)
SELECT 
    m.id,
    'Understanding Singapore''s Banking System',
    'video',
    12,
    '{"videoUrl": "https://example.com/video2", "textContent": "Learn about local banks, ATMs, and digital banking"}',
    2
FROM public.modules m 
WHERE m.title = 'Financial Basics for Migrant Workers'
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (module_id, title, type, duration_minutes, content, order_index)
SELECT 
    m.id,
    'Creating Your First Budget',
    'text',
    8,
    '{"textContent": "Step-by-step guide to creating a monthly budget that works for your income and expenses in Singapore."}',
    3
FROM public.modules m 
WHERE m.title = 'Financial Basics for Migrant Workers'
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (module_id, title, type, duration_minutes, content, order_index)
SELECT 
    m.id,
    'Budgeting Quiz',
    'quiz',
    5,
    '{"quizQuestions": [
        {
            "id": "q1",
            "question": "What percentage of your income should go to savings?",
            "options": ["10-15%", "20-30%", "5-10%", "40-50%"],
            "correctAnswer": 0,
            "explanation": "Financial experts recommend saving 10-15% of your income for emergencies and future goals."
        },
        {
            "id": "q2", 
            "question": "Which expense should be prioritized in your budget?",
            "options": ["Entertainment", "Rent and utilities", "Shopping", "Dining out"],
            "correctAnswer": 1,
            "explanation": "Rent and utilities are essential expenses that should be prioritized to maintain stable housing."
        }
    ]}',
    4
FROM public.modules m 
WHERE m.title = 'Financial Basics for Migrant Workers'
ON CONFLICT DO NOTHING;
