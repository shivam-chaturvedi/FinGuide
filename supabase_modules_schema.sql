-- =============================================
-- FinGuide Modules Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. MODULES TABLE
-- =============================================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    duration VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('basics', 'management', 'remittance', 'advanced')),
    price VARCHAR(20) NOT NULL CHECK (price IN ('Free', 'Premium')),
    thumbnail VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- =============================================
-- 2. MODULE_LEARNING_OUTCOMES TABLE
-- =============================================
CREATE TABLE module_learning_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    outcome_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. MODULE_PREREQUISITES TABLE
-- =============================================
CREATE TABLE module_prerequisites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    prerequisite_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. LESSONS TABLE
-- =============================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
    duration VARCHAR(50) NOT NULL,
    content JSONB NOT NULL, -- Stores video URLs, text content, quiz questions
    sort_order INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. USER_MODULE_PROGRESS TABLE
-- =============================================
CREATE TABLE user_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'not-started' CHECK (status IN ('completed', 'in-progress', 'locked', 'not-started')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- =============================================
-- 6. USER_LESSON_PROGRESS TABLE
-- =============================================
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    quiz_answers JSONB, -- Stores user's quiz answers
    quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- =============================================
-- 7. MODULE_RATINGS TABLE
-- =============================================
CREATE TABLE module_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- =============================================
-- 8. MODULE_CERTIFICATES TABLE
-- =============================================
CREATE TABLE module_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Modules indexes
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_level ON modules(level);
CREATE INDEX idx_modules_price ON modules(price);
CREATE INDEX idx_modules_active ON modules(is_active);
CREATE INDEX idx_modules_sort_order ON modules(sort_order);

-- Lessons indexes
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_type ON lessons(type);
CREATE INDEX idx_lessons_sort_order ON lessons(sort_order);

-- User progress indexes
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module_id ON user_module_progress(module_id);
CREATE INDEX idx_user_module_progress_status ON user_module_progress(status);

CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_completed ON user_lesson_progress(is_completed);

-- Ratings indexes
CREATE INDEX idx_module_ratings_module_id ON module_ratings(module_id);
CREATE INDEX idx_module_ratings_user_id ON module_ratings(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_certificates ENABLE ROW LEVEL SECURITY;

-- Modules policies (public read, admin write)
CREATE POLICY "Modules are viewable by everyone" ON modules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Modules are manageable by admins" ON modules
    FOR ALL USING (auth.role() = 'service_role');

-- Learning outcomes policies
CREATE POLICY "Learning outcomes are viewable by everyone" ON module_learning_outcomes
    FOR SELECT USING (true);

CREATE POLICY "Learning outcomes are manageable by admins" ON module_learning_outcomes
    FOR ALL USING (auth.role() = 'service_role');

-- Prerequisites policies
CREATE POLICY "Prerequisites are viewable by everyone" ON module_prerequisites
    FOR SELECT USING (true);

CREATE POLICY "Prerequisites are manageable by admins" ON module_prerequisites
    FOR ALL USING (auth.role() = 'service_role');

-- Lessons policies
CREATE POLICY "Lessons are viewable by everyone" ON lessons
    FOR SELECT USING (true);

CREATE POLICY "Lessons are manageable by admins" ON lessons
    FOR ALL USING (auth.role() = 'service_role');

-- User progress policies (users can only access their own data)
CREATE POLICY "Users can view their own module progress" ON user_module_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own module progress" ON user_module_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lesson progress" ON user_lesson_progress
    FOR ALL USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON module_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON module_ratings
    FOR ALL USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON module_certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own certificates" ON module_certificates
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_module_progress_updated_at BEFORE UPDATE ON user_module_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_ratings_updated_at BEFORE UPDATE ON module_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate module progress
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Get total lessons in module
    SELECT COUNT(*) INTO total_lessons
    FROM lessons
    WHERE module_id = p_module_id;
    
    -- Get completed lessons for user
    SELECT COUNT(*) INTO completed_lessons
    FROM user_lesson_progress ulp
    JOIN lessons l ON ulp.lesson_id = l.id
    WHERE ulp.user_id = p_user_id 
    AND l.module_id = p_module_id 
    AND ulp.is_completed = true;
    
    -- Calculate percentage
    IF total_lessons > 0 THEN
        progress_percentage := (completed_lessons * 100) / total_lessons;
    ELSE
        progress_percentage := 0;
    END IF;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update module progress when lesson is completed
CREATE OR REPLACE FUNCTION update_module_progress_on_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
    module_id_var UUID;
    progress_percentage INTEGER;
BEGIN
    -- Get module_id from the lesson
    SELECT l.module_id INTO module_id_var
    FROM lessons l
    WHERE l.id = NEW.lesson_id;
    
    -- Calculate new progress
    progress_percentage := calculate_module_progress(NEW.user_id, module_id_var);
    
    -- Update or insert user module progress
    INSERT INTO user_module_progress (user_id, module_id, progress_percentage, status, last_accessed_at)
    VALUES (NEW.user_id, module_id_var, progress_percentage, 
            CASE 
                WHEN progress_percentage = 100 THEN 'completed'
                WHEN progress_percentage > 0 THEN 'in-progress'
                ELSE 'not-started'
            END, NOW())
    ON CONFLICT (user_id, module_id)
    DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        status = EXCLUDED.status,
        last_accessed_at = EXCLUDED.last_accessed_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update module progress when lesson is completed
CREATE TRIGGER update_module_progress_trigger
    AFTER UPDATE OF is_completed ON user_lesson_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = true AND OLD.is_completed = false)
    EXECUTE FUNCTION update_module_progress_on_lesson_completion();

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample modules
INSERT INTO modules (id, title, description, rating, duration, level, category, price, thumbnail, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Financial Basics for Migrant Workers', 'Master the fundamentals of personal finance, budgeting, and money management specifically designed for migrant workers in Singapore.', 4.8, '4 weeks', 'Beginner', 'basics', 'Free', 'Financial Basics', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Smart Savings & Investment Strategies', 'Learn how to save money effectively and make your money work for you through safe investment options.', 4.7, '3 weeks', 'Intermediate', 'management', 'Free', 'Savings & Investment', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Safe Remittances & Money Transfers', 'Master the art of sending money home safely, affordably, and efficiently using various remittance services.', 4.9, '2 weeks', 'Beginner', 'remittance', 'Premium', 'Remittances', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Advanced Financial Planning', 'Take your financial knowledge to the next level with advanced planning, investment strategies, and wealth building.', 4.6, '6 weeks', 'Advanced', 'advanced', 'Premium', 'Advanced Planning', 4);

-- Insert learning outcomes for module 1
INSERT INTO module_learning_outcomes (module_id, outcome_text, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Understand Singapore''s financial system', 1),
('550e8400-e29b-41d4-a716-446655440001', 'Create and maintain a personal budget', 2),
('550e8400-e29b-41d4-a716-446655440001', 'Learn about banking and savings accounts', 3),
('550e8400-e29b-41d4-a716-446655440001', 'Understand basic investment concepts', 4);

-- Insert prerequisites for module 1
INSERT INTO module_prerequisites (module_id, prerequisite_text, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Basic English', 1),
('550e8400-e29b-41d4-a716-446655440001', 'Singapore work permit', 2);

-- Insert sample lessons for module 1
INSERT INTO lessons (id, module_id, title, type, duration, content, sort_order, is_locked) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to Financial Literacy', 'video', '5 min', '{"videoUrl": "https://example.com/video1", "textContent": "Introduction to financial literacy for migrant workers"}', 1, false),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Understanding Singapore''s Banking System', 'video', '12 min', '{"videoUrl": "https://example.com/video2", "textContent": "Learn about local banks, ATMs, and digital banking"}', 2, false),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Creating Your First Budget', 'text', '8 min', '{"textContent": "Step-by-step guide to creating a monthly budget that works for your income and expenses in Singapore."}', 3, false),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Budgeting Quiz', 'quiz', '5 min', '{"quizQuestions": [{"id": "q1", "question": "What percentage of your income should go to savings?", "options": ["10-15%", "20-30%", "5-10%", "40-50%"], "correctAnswer": 0, "explanation": "Financial experts recommend saving 10-15% of your income for emergencies and future goals."}]}', 4, false);

-- =============================================
-- USEFUL QUERIES FOR FRONTEND
-- =============================================

-- Get all modules with learning outcomes and prerequisites
CREATE OR REPLACE VIEW modules_with_details AS
SELECT 
    m.*,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', mlo.id,
                'outcome_text', mlo.outcome_text,
                'sort_order', mlo.sort_order
            ) ORDER BY mlo.sort_order
        ) FILTER (WHERE mlo.id IS NOT NULL), 
        '[]'::json
    ) as learning_outcomes,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', mp.id,
                'prerequisite_text', mp.prerequisite_text,
                'sort_order', mp.sort_order
            ) ORDER BY mp.sort_order
        ) FILTER (WHERE mp.id IS NOT NULL), 
        '[]'::json
    ) as prerequisites
FROM modules m
LEFT JOIN module_learning_outcomes mlo ON m.id = mlo.module_id
LEFT JOIN module_prerequisites mp ON m.id = mp.module_id
WHERE m.is_active = true
GROUP BY m.id, m.title, m.description, m.rating, m.duration, m.level, m.category, m.price, m.thumbnail, m.created_at, m.updated_at, m.is_active, m.sort_order
ORDER BY m.sort_order;

-- Get user's module progress with module details
CREATE OR REPLACE VIEW user_modules_with_progress AS
SELECT 
    m.*,
    ump.status,
    ump.progress_percentage,
    ump.quiz_score,
    ump.started_at,
    ump.completed_at,
    ump.last_accessed_at
FROM modules m
LEFT JOIN user_module_progress ump ON m.id = ump.module_id AND ump.user_id = auth.uid()
WHERE m.is_active = true
ORDER BY m.sort_order;

-- Get module lessons with user progress
CREATE OR REPLACE VIEW module_lessons_with_progress AS
SELECT 
    l.*,
    ulp.is_completed as user_completed,
    ulp.quiz_answers,
    ulp.quiz_score as user_quiz_score,
    ulp.completed_at as user_completed_at
FROM lessons l
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = auth.uid()
WHERE l.module_id = $1
ORDER BY l.sort_order;
