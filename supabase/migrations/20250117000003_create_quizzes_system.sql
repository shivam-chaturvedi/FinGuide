-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    questions JSONB NOT NULL, -- Store quiz questions as JSON
    passing_score INTEGER DEFAULT 80, -- Minimum score to pass (percentage)
    time_limit_minutes INTEGER, -- Optional time limit
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz attempts table to track user quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    answers JSONB, -- Store user's answers
    score INTEGER, -- Final score percentage
    passed BOOLEAN DEFAULT false,
    time_taken_minutes INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update modules table to reference quizzes
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL;

-- Update lessons table to remove quiz content (quizzes are now separate)
ALTER TABLE public.lessons 
DROP COLUMN IF EXISTS content;

-- Add content fields for non-quiz lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module_id ON public.quiz_attempts(module_id);

-- Enable RLS for new tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for quizzes table
CREATE POLICY "Users can read published quizzes" ON public.quizzes
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all quizzes" ON public.quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for quiz_attempts table
CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON public.quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_attempts_updated_at 
    BEFORE UPDATE ON public.quiz_attempts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample quiz data
INSERT INTO public.quizzes (
    name, description, questions, passing_score, time_limit_minutes, is_published, created_by
) VALUES (
    'Financial Basics Quiz',
    'Test your knowledge of basic financial concepts for migrant workers',
    '[
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
        },
        {
            "id": "q3",
            "question": "What is the purpose of an emergency fund?",
            "options": ["To invest in stocks", "To cover unexpected expenses", "To buy luxury items", "To pay for vacations"],
            "correctAnswer": 1,
            "explanation": "An emergency fund is specifically for covering unexpected expenses like medical bills or job loss."
        }
    ]',
    80,
    15,
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
) ON CONFLICT (name) DO NOTHING;

-- Insert another sample quiz
INSERT INTO public.quizzes (
    name, description, questions, passing_score, time_limit_minutes, is_published, created_by
) VALUES (
    'Savings and Investment Quiz',
    'Test your understanding of savings strategies and investment basics',
    '[
        {
            "id": "q1",
            "question": "How many months of expenses should your emergency fund cover?",
            "options": ["1-2 months", "3-6 months", "12 months", "2 years"],
            "correctAnswer": 1,
            "explanation": "An emergency fund should cover 3-6 months of essential expenses to provide financial security."
        },
        {
            "id": "q2",
            "question": "What is compound interest?",
            "options": ["Interest on principal only", "Interest on principal plus previously earned interest", "Fixed interest rate", "Interest paid monthly"],
            "correctAnswer": 1,
            "explanation": "Compound interest is interest calculated on the initial principal and the accumulated interest from previous periods."
        }
    ]',
    75,
    10,
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
) ON CONFLICT (name) DO NOTHING;

-- Update existing modules to reference quizzes
UPDATE public.modules 
SET quiz_id = (SELECT id FROM public.quizzes WHERE name = 'Financial Basics Quiz' LIMIT 1)
WHERE title = 'Financial Basics for Migrant Workers';

-- Update existing lessons to use new structure
UPDATE public.lessons 
SET 
    video_url = content->>'videoUrl',
    text_content = content->>'textContent'
WHERE content IS NOT NULL;

-- Remove the content column from lessons
ALTER TABLE public.lessons DROP COLUMN IF EXISTS content;

