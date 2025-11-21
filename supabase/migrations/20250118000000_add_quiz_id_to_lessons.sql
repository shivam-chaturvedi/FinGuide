-- Add quiz_id column to lessons table to allow individual lesson quiz assignments
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_quiz_id ON public.lessons(quiz_id);

-- Add comment to explain the purpose
COMMENT ON COLUMN public.lessons.quiz_id IS 'Optional quiz assignment for individual lessons within a module';




