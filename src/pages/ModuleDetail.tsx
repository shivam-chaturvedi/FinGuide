import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Star,
  Download,
  Play,
  Clock,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import DOMPurify from 'dompurify';

const ModuleViewer = ({ html, className = '' }: { html: string; className?: string }) => {
  const safeHtml = DOMPurify.sanitize(html || '');
  return (
    <div
      className={`prose prose-base sm:prose-lg lg:prose-xl max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: string;
  name: string;
  description: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit_minutes?: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  rating: number;
  duration_weeks: number;
  level: string;
  progress: number;
  status: string;
  price: string;
  thumbnail: string;
  what_youll_learn: string[];
  prerequisites: string[];
  quiz_score: number;
  video_url: string;
  thumbnail_url: string;
  quiz_id: string;
}

interface LessonData {
  id: string;
  module_id: string;
  title: string;
  type: string;
  duration_minutes: number;
  video_url: string;
  text_content: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  quiz_id: string | null;
  is_completed: boolean;
  is_locked: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface LessonDraft {
  title: string;
  duration_minutes: number;
  video_url: string;
  text_content: string;
}

interface QuizReview {
  answers: Record<string, number>;
  questions: QuizQuestion[];
  score: number;
  passed: boolean;
  timestamp: string;
}

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>({
    title: '',
    duration_minutes: 0,
    video_url: '',
    text_content: ''
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [lastQuizReview, setLastQuizReview] = useState<QuizReview | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [selectedAttemptLabel, setSelectedAttemptLabel] = useState<string>('');
  const [selectedAttemptReview, setSelectedAttemptReview] = useState<QuizReview | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadModuleData();
    }
  }, [id]);

  const fetchLessonProgress = async (lessonIds: string[]) => {
    if (!user || lessonIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, is_completed')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        return {};
      }

      // Convert array to object for easy lookup
      const progressMap: Record<string, boolean> = {};
      data?.forEach(progress => {
        progressMap[progress.lesson_id] = progress.is_completed;
      });

      return progressMap;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return {};
    }
  };

  const handleLessonDraftChange = (field: keyof LessonDraft, value: string) => {
    const nextValue = field === 'duration_minutes' ? Number(value) || 0 : value;
    setLessonDraft(prev => ({
      ...prev,
      [field]: nextValue
    } as LessonDraft));
  };

  const handleSaveLessonEdits = async () => {
    if (!selectedLesson) return;

    setSavingLesson(true);
    try {
      const updates = {
        title: lessonDraft.title,
        duration_minutes: Number(lessonDraft.duration_minutes) || 0,
        video_url: lessonDraft.video_url || null,
        text_content: lessonDraft.text_content || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', selectedLesson.id);

      if (error) throw error;

      const updatedLesson = {
        ...selectedLesson,
        ...updates
      };

      setLessons(prev => prev.map(lesson => lesson.id === selectedLesson.id ? updatedLesson : lesson));
      setSelectedLesson(updatedLesson);

      toast({
        title: "Lesson updated",
        description: "Your changes have been saved."
      });
      setIsEditingLesson(false);
    } catch (err) {
      console.error('Error updating lesson:', err);
      toast({
        title: "Error",
        description: "Failed to save lesson changes",
        variant: "destructive"
      });
    } finally {
      setSavingLesson(false);
    }
  };

  const loadModuleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch module data
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (moduleError) {
        throw moduleError;
      }

      if (!module) {
        setError('Module not found');
        return;
      }

      console.log('Module data:', module);
      setModuleData(module);

      // Fetch lessons for this module
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      } else {
        console.log('Lessons data:', lessonsData);
        // Ensure all lessons have quiz_id field
        const formattedLessons = (lessonsData || []).map(lesson => ({
          ...lesson,
          quiz_id: (lesson as any).quiz_id || null
        }));
        console.log('Formatted lessons:', formattedLessons);
        setLessons(formattedLessons);
        
        // Fetch lesson progress for this user
        if (user && formattedLessons.length > 0) {
          const lessonIds = formattedLessons.map(lesson => lesson.id);
          const progress = await fetchLessonProgress(lessonIds);
          setLessonProgress(progress);
          console.log('Lesson progress:', progress);
        }
        
        if (formattedLessons && formattedLessons.length > 0) {
          console.log('Setting first lesson as selected:', formattedLessons[0]);
          setSelectedLesson(formattedLessons[0]);
        }
      }

      // Load user module progress to show personalized status/progress
      if (user) {
        await loadUserModuleProgress(module.id);
      }

    } catch (error) {
      console.error('Error loading module:', error);
      setError('Failed to load module');
      toast({
        title: "Error",
        description: "Failed to load module details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserModuleProgress = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_module_progress')
        .select('status, progress, quiz_score, completed_at')
        .eq('user_id', user?.id)
        .eq('module_id', moduleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows; ignore
        throw error;
      }

      if (data) {
        setModuleData(prev => prev ? {
          ...prev,
          status: data.status || prev.status,
          progress: data.progress ?? prev.progress ?? 0,
          quiz_score: data.quiz_score ?? prev.quiz_score
        } : prev);
      }
    } catch (err) {
      console.error('Error loading user module progress:', err);
    }
  };

  const handleStartModule = async () => {
    if (!user || !moduleData) return;

    try {
      // Create or update module progress
      const { error: moduleProgressError } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleData.id,
          status: 'in-progress',
          progress: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (moduleProgressError) throw moduleProgressError;

      setModuleData(prev => prev ? { ...prev, status: 'in-progress', progress: prev.progress ?? 0 } : prev);

      toast({
        title: "Success",
        description: "Module started successfully"
      });

    } catch (error) {
      console.error('Error starting module:', error);
      toast({
        title: "Error",
        description: "Failed to start module",
        variant: "destructive"
      });
    }
  };

  const handleStartQuiz = () => {
    if (!quizData || quizLoading) {
      toast({
        title: "Quiz not ready",
        description: "Please wait while we load the quiz for this lesson.",
      });
      return;
    }
    setLastQuizReview(null);
    setSelectedAttemptId(null);
    setSelectedAttemptLabel('');
    setSelectedAttemptReview(null);
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizCompleted(false);
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !user || !selectedLesson) return;

    const totalQuestions = quizData.questions.length;
    if (totalQuestions === 0) {
      toast({
        title: "No questions",
        description: "This quiz has no questions assigned yet.",
      });
      return;
    }

    let correctAnswers = 0;
    quizData.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passingScore = quizData.passing_score ?? 80;
    const passed = score >= passingScore;

    setQuizScore(score);
    setQuizCompleted(true);
    setSelectedAttemptId(null);
    setSelectedAttemptLabel('');
    setSelectedAttemptReview(null);
    const review = createQuizReview({ ...quizAnswers }, score, passed, new Date().toISOString());
    if (review) {
      setLastQuizReview(review);
    }

    try {
      await handleQuizComplete(score, passed);

      toast({
        title: passed ? "Quiz Passed!" : "Quiz Failed",
        description: `You scored ${score}%. ${passed ? 'Congratulations!' : 'Try again to improve your score.'}`,
        variant: passed ? "default" : "destructive"
      });

      setShowQuiz(false);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz results",
        variant: "destructive"
      });
    }
  };

  const fetchQuizAttempts = async (quizId: string | null) => {
    if (!user || !moduleData || !quizId) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id) 
        .eq('module_id', moduleData.id)
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz attempts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
  };

  const loadLessonQuiz = async (quizId: string | null) => {
    if (!quizId) {
      setQuizData(null);
      return;
    }

    try {
      setQuizLoading(true);
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('is_published', true)
        .single();

      if (quizError) {
        console.error('Error fetching quiz:', quizError);
        setQuizData(null);
        return;
      }

      const transformedQuiz: QuizData = {
        ...(quiz as QuizData),
        questions: (quiz?.questions || []) as any as QuizQuestion[],
      };
      setQuizData(transformedQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setQuizData(null);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedLesson) {
      syncLessonDraftWithSelection();
      setIsEditingLesson(false);
      setLastQuizReview(null);
      setSelectedAttemptId(null);
      setSelectedAttemptLabel('');
      setSelectedAttemptReview(null);
      setLessonCompleted(false);
      return;
    }

    syncLessonDraftWithSelection();
    setIsEditingLesson(false);
    setLastQuizReview(null);
    setSelectedAttemptId(null);
    setSelectedAttemptLabel('');
    setSelectedAttemptReview(null);

    setLessonCompleted(lessonProgress[selectedLesson.id] || false);

    if (selectedLesson.quiz_id) {
      fetchQuizAttempts(selectedLesson.quiz_id).then(setQuizAttempts);
    } else {
      setQuizAttempts([]);
    }
    setQuizAnswers({});
    setQuizScore(null);
    setQuizCompleted(false);
    setShowQuiz(false);
    loadLessonQuiz(selectedLesson.quiz_id);
  }, [selectedLesson, lessonProgress]);

  const updateModuleProgress = async (extraCompletedLessonId?: string) => {
    if (!user || !moduleData) return;

    try {
      // Count completed lessons using local progress map (freshest) with DB fallback
      let completedCount = lessons.filter(l => lessonProgress[l.id] || l.id === extraCompletedLessonId).length;
      if (completedCount === 0) {
        const result = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('module_id', moduleData.id)
          .eq('is_completed', true);

        if (result.error) throw result.error;
        completedCount = result.data?.length || 0;
      }

      const totalLessons = lessons.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Determine module status
      let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
      if (completedCount > 0 && completedCount < totalLessons) {
        status = 'in-progress';
      } else if (completedCount === totalLessons && totalLessons > 0) {
        status = 'completed';
      }

      // Update or create module progress record
      const { error: moduleProgressError } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleData.id,
          progress: progressPercentage,
          status: status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });

      if (moduleProgressError) throw moduleProgressError;

      console.log(`Module progress updated: ${progressPercentage}% (${completedCount}/${totalLessons} lessons)`);

      // Reflect updated progress/status locally for immediate UI feedback
      setModuleData(prev => prev ? {
        ...prev,
        progress: progressPercentage,
        status
      } : prev);

      const eventDetail = {
        moduleId: moduleData.id,
        progress: progressPercentage,
        status
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('module-progress-updated', { detail: eventDetail }));
      }
    } catch (error) {
      console.error('Error updating module progress:', error);
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (!selectedLesson || !user) return;

    try {
      // Save quiz attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: selectedLesson.quiz_id,
          module_id: selectedLesson.module_id,
          answers: quizAnswers,
          score: score,
          passed: passed,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Upsert lesson progress; mark complete only when passed
      const { error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          module_id: selectedLesson.module_id,
          lesson_id: selectedLesson.id,
          is_completed: passed,
          completed_at: passed ? new Date().toISOString() : null,
          quiz_answers: quizAnswers,
          quiz_score: score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (lessonProgressError) throw lessonProgressError;

      // Update local completion state
      setLessonCompleted(passed);
      setLessonProgress(prev => ({
        ...prev,
        [selectedLesson.id]: passed
      }));

      // Refresh quiz attempts scoped to this quiz
      if (selectedLesson?.quiz_id) {
        const attempts = await fetchQuizAttempts(selectedLesson.quiz_id);
        setQuizAttempts(attempts);
      }

      // Refresh module progress to reflect completed lesson count
      await updateModuleProgress(passed ? selectedLesson.id : undefined);

    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizCompleted(false);
    setSelectedAttemptId(null);
    setSelectedAttemptLabel('');
    setSelectedAttemptReview(null);
  };

  const syncLessonDraftWithSelection = () => {
    setLessonDraft({
      title: selectedLesson?.title || '',
      duration_minutes: selectedLesson?.duration_minutes || 0,
      video_url: selectedLesson?.video_url || '',
      text_content: selectedLesson?.text_content || ''
    });
  };

  const calculateQuizScore = (answers: Record<string, number>, questions: any[]) => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const normalizeAnswers = (answers?: Record<string, number | string>) => {
    const normalized: Record<string, number> = {};
    if (!answers) return normalized;
    Object.entries(answers).forEach(([key, value]) => {
      const parsed = typeof value === 'number' ? value : Number(value);
      if (!Number.isNaN(parsed)) {
        normalized[key] = parsed;
      }
    });
    return normalized;
  };

  const createQuizReview = (answers: Record<string, number>, score: number, passed: boolean, timestamp?: string) => {
    if (!quizData) return null;
    return {
      answers,
      questions: quizData.questions,
      score,
      passed,
      timestamp: timestamp || new Date().toISOString()
    };
  };

  const buildQuizReviewFromAttempt = (attempt: any) => {
    if (!quizData) return null;
    const normalizedAnswers = normalizeAnswers(attempt.answers);
    const computedScore = typeof attempt.score === 'number'
      ? attempt.score
      : calculateQuizScore(normalizedAnswers, quizData.questions);
    const passingScore = quizData.passing_score ?? 80;
    const passed = typeof attempt.passed === 'boolean'
      ? attempt.passed
      : computedScore >= passingScore;
    return createQuizReview(normalizedAnswers, computedScore, passed, attempt.completed_at);
  };

  const handleAttemptClick = (attempt: any, index: number) => {
    if (!quizData) return;
    if (selectedAttemptId === attempt.id) {
      setSelectedAttemptId(null);
      setSelectedAttemptLabel('');
      setSelectedAttemptReview(null);
      setReviewDialogOpen(false);
      return;
    }

    const review = buildQuizReviewFromAttempt(attempt);
    if (!review) return;
    const timestamp = attempt.completed_at ? ` · ${new Date(attempt.completed_at).toLocaleString()}` : '';
    setSelectedAttemptId(attempt.id);
    setSelectedAttemptLabel(`Attempt #${index + 1}${timestamp}`);
    setSelectedAttemptReview(review);
    setReviewDialogOpen(true);
  };

  const renderQuizReviewSection = (review: QuizReview, label: string) => (
    <div className="space-y-3 pt-4 mt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">
            {review.score}% · {review.passed ? 'Passed' : 'Needs improvement'}
          </p>
          {review.timestamp && (
            <p className="text-xs text-muted-foreground">
              {new Date(review.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${review.passed ? 'text-emerald-600' : 'text-red-600'}`}>
          {review.passed ? 'Passed' : 'Review'}
        </span>
      </div>
      <div className="space-y-3">
        {review.questions.map((question, index) => {
          const selectedIndex = review.answers[question.id];
          const isCorrect = selectedIndex === question.correctAnswer;
          const userAnswer =
            typeof selectedIndex === 'number' && selectedIndex >= 0 && selectedIndex < question.options.length
              ? question.options[selectedIndex]
              : 'Not answered';
          return (
            <div
              key={question.id}
              className={`p-3 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Question {index + 1}</p>
                <span className={`text-xs font-semibold uppercase ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{question.question}</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Your answer:</span>{' '}
                  {userAnswer}
                </p>
                {!isCorrect && (
                  <p>
                    <span className="font-semibold">Correct answer:</span>{' '}
                    {question.options[question.correctAnswer]}
                  </p>
                )}
                {question.explanation && (
                  <p className="text-xs text-muted-foreground">
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleRetakeQuiz = () => {
    setLastQuizReview(null);
    setSelectedAttemptId(null);
    setSelectedAttemptLabel('');
    setSelectedAttemptReview(null);
    resetQuiz();
    setShowQuiz(true);
    setReviewDialogOpen(false);
  };

  const toTitleCase = (value?: string | null) => {
    if (!value) return '';
    return value
      .replace(/[-_]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return 'Not started';
    if (status === 'in-progress') return 'In progress';
    return toTitleCase(status);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'basics':
        return <Target className="h-5 w-5" />;
      case 'management':
        return <TrendingUp className="h-5 w-5" />;
      case 'remittance':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderLessonContent = (lesson: LessonData) => {
    // Handle quiz lessons
    if (lesson.type === 'quiz' && lesson.quiz_id) {
      return (
        <div className="space-y-4">
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">Quiz: {lesson.title}</h3>
            <p className="text-muted-foreground mb-4">
              Test your knowledge with this interactive quiz
            </p>
            <Button 
              onClick={() => setShowQuiz(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Quiz
            </Button>
          </div>
        </div>
      );
    }

    // Handle video lessons
    if (lesson.type === 'video' && lesson.video_url) {
      return (
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              <source src={lesson.video_url} type="video/mp4" />
              <source src={lesson.video_url} type="video/webm" />
              <source src={lesson.video_url} type="video/ogg" />
            </video>
          </div>
          {lesson.text_content && (
            <ModuleViewer html={lesson.text_content} className="text-muted-foreground" />
          )}
        </div>
      );
    }

    if (lesson.file_url) {
      const fileType = lesson.file_url.split('.').pop()?.toLowerCase();
      const mimeType = lesson.file_type?.split('/')[0];

      if (fileType === 'pdf' || mimeType === 'application') {
        return (
          <div className="space-y-4">
            <div className="h-96 border rounded-lg">
              <iframe
                src={lesson.file_url}
                className="w-full h-full"
                title={lesson.title}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">{lesson.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.file_type} • {formatFileSize(lesson.file_size || 0)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.file_url, '_blank')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        );
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType || '') || mimeType === 'image') {
        return (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={lesson.file_url}
                alt={lesson.title}
                className="max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{lesson.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.file_type} • {formatFileSize(lesson.file_size || 0)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.file_url, '_blank')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">{lesson.title}</h3>
              <div className="text-muted-foreground mb-4">
                {lesson.text_content ? <ModuleViewer html={lesson.text_content} /> : 'Document content'}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{lesson.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.file_type} • {formatFileSize(lesson.file_size || 0)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.file_url, '_blank')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        );
      }
    }

    // Handle text lessons
    return (
      <div className="space-y-4">
        {lesson.text_content ? (
          <ModuleViewer html={lesson.text_content} className="text-muted-foreground" />
        ) : (
          <div className="leading-relaxed whitespace-pre-wrap text-muted-foreground">No content available</div>
        )}
        {lesson.file_url && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{lesson.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  {lesson.file_type} • {formatFileSize(lesson.file_size || 0)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open(lesson.file_url, '_blank')}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading Course Details</p>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we fetch the course content...</p>
        </div>
        
        {/* Loading skeleton for module detail */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-lg border shadow-card animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border shadow-card animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-muted rounded"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-5 w-16 bg-muted rounded-full"></div>
                </div>
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-card rounded-lg border shadow-card animate-pulse p-6 space-y-4">
              <div className="h-5 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border shadow-card animate-pulse p-6 space-y-4">
              <div className="h-5 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <Alert>
            <AlertDescription>
              {error || 'Module not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Full width on mobile */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/modules')}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        
        {/* Title and Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
            {moduleData.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {moduleData.description}
          </p>
        </div>
        {typeof moduleData.progress === 'number' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Course progress</span>
              <span>{moduleData.progress}% complete</span>
            </div>
            <Progress value={moduleData.progress} className="h-2" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Selected Lesson Content */}
          {selectedLesson && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    {selectedLesson.type === "video" && <Video className="h-5 w-5 text-red-500" />}
                    {selectedLesson.type === "text" && <FileText className="h-5 w-5 text-blue-500" />}
                    {selectedLesson.type === "quiz" && <HelpCircle className="h-5 w-5 text-purple-500" />}
                    <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isEditingLesson) {
                            syncLessonDraftWithSelection();
                            setIsEditingLesson(false);
                            return;
                          }
                          setIsEditingLesson(true);
                        }}
                        disabled={savingLesson}
                      >
                        {isEditingLesson ? 'Cancel edits' : 'Edit lesson'}
                      </Button>
                    )}
                    <Badge variant="outline">{selectedLesson.duration_minutes} min</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderLessonContent(selectedLesson)}

                {isAdmin && isEditingLesson && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <h3 className="text-base font-semibold">Edit lesson</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Lesson title</p>
                        <Input
                          value={lessonDraft.title}
                          onChange={(event) => handleLessonDraftChange('title', event.target.value)}
                          disabled={savingLesson}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Duration (minutes)</p>
                        <Input
                          type="number"
                          min={0}
                          value={lessonDraft.duration_minutes}
                          onChange={(event) => handleLessonDraftChange('duration_minutes', event.target.value)}
                          disabled={savingLesson}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Video URL</p>
                      <Input
                        type="url"
                        value={lessonDraft.video_url}
                        onChange={(event) => handleLessonDraftChange('video_url', event.target.value)}
                        disabled={savingLesson}
                      />
                      <p className="text-xs text-muted-foreground">Leave blank if this lesson is text-only.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Lesson content</p>
                      <Textarea
                        value={lessonDraft.text_content}
                        onChange={(event) => handleLessonDraftChange('text_content', event.target.value)}
                        disabled={savingLesson}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          syncLessonDraftWithSelection();
                          setIsEditingLesson(false);
                        }}
                        disabled={savingLesson}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveLessonEdits}
                        disabled={savingLesson}
                      >
                        {savingLesson ? 'Saving...' : 'Save changes'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4 mt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {lessonCompleted && (
                      <Badge variant="default" className="bg-green-600">
                        ✓ Completed
                      </Badge>
                    )}
                    {selectedLesson?.quiz_id && (
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        Quiz Available
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedLesson?.quiz_id && (
                      <Button 
                        onClick={() => {
                          resetQuiz();
                          setShowQuiz(true);
                        }}
                        variant="outline"
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                        disabled={quizLoading || !quizData || (quizData.questions.length === 0)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {quizLoading ? 'Loading...' : 'Take Quiz'}
                      </Button>
                    )}
                  </div>
                </div>

                {selectedLesson?.quiz_id && quizAttempts.length > 0 && (
                  <div className="space-y-4 pt-4 mt-4 border-t">
                    <h3 className="font-semibold text-lg">Quiz Attempts History</h3>
                    <div className="space-y-3">
                      {quizAttempts.map((attempt, index) => {
                        const isSelected = selectedAttemptId === attempt.id;
                        const attemptScore = typeof attempt.score === 'number'
                          ? attempt.score
                          : quizData
                            ? calculateQuizScore(normalizeAnswers(attempt.answers), quizData.questions)
                            : 0;

                        return (
                          <div
                            key={attempt.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleAttemptClick(attempt, index)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleAttemptClick(attempt, index);
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                              <div>
                                <p className="font-medium">
                                  Attempt #{index + 1}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(attempt.completed_at).toLocaleDateString()} at {new Date(attempt.completed_at).toLocaleTimeString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Click to review answers
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {attemptScore}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {attempt.passed ? 'Passed' : 'Failed'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedAttemptReview && renderQuizReviewSection(selectedAttemptReview, selectedAttemptLabel || 'Attempt review')}
                  </div>
                )}
          {selectedLesson?.quiz_id && lastQuizReview && renderQuizReviewSection(lastQuizReview, 'Latest quiz review')}
        </CardContent>
      </Card>
    )}

      {selectedAttemptReview && (
        <Dialog open={reviewDialogOpen} onOpenChange={(open) => setReviewDialogOpen(open)}>
        <DialogContent className="max-w-3xl bg-background fixed bottom-6 left-1/2 -translate-x-1/2 rounded-2xl shadow-2xl w-full md:w-[820px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedAttemptLabel || 'Quiz attempt review'}
            </DialogTitle>
            <DialogDescription>
              Review every answer and highlight the ones you missed.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[82vh] overflow-y-auto pr-2">
            {renderQuizReviewSection(selectedAttemptReview, selectedAttemptLabel || 'Attempt review')}
          </div>
        </DialogContent>
        </Dialog>
      )}
          

          {/* Welcome Message - Show when no lesson is selected */}
          {!selectedLesson && lessons.length > 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Welcome to {moduleData.title}</h3>
                <p className="text-muted-foreground mb-4">
                  Click on any lesson from the sidebar to start learning
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                  <FileText className="h-4 w-4 ml-4" />
                  <span>Text Lessons</span>
                  <HelpCircle className="h-4 w-4 ml-4" />
                  <span>Quizzes</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Module Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Course Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">{toTitleCase(moduleData.level) || 'Beginner'}</Badge>
                <Badge variant="outline" className="text-xs">{toTitleCase(moduleData.category) || 'General'}</Badge>
                <Badge variant="outline" className="text-xs">{moduleData.price || 'Free'}</Badge>
              </div>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{moduleData.duration_weeks ?? 0} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span>{moduleData.estimated_duration ?? 0} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{moduleData.rating ?? 0}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span>{toTitleCase(moduleData.difficulty_level || moduleData.level) || 'Beginner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{formatStatus(moduleData.status)}</span>
                </div>
                {typeof moduleData.progress === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span>{moduleData.progress}%</span>
                  </div>
                )}
              </div>

              {moduleData.what_youll_learn && moduleData.what_youll_learn.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">What you'll learn:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {moduleData.what_youll_learn.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {moduleData.prerequisites && moduleData.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Prerequisites:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {moduleData.prerequisites.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          {lessons.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Lessons ({lessons.length})</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('Lesson clicked:', lesson);
                      setSelectedLesson(lesson);
                      setLessonCompleted(lessonProgress[lesson.id] || false);
                    }}
                  >
                    <div className="flex-shrink-0">
                      {lesson.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                      {lesson.type === "text" && <FileText className="h-4 w-4 text-blue-500" />}
                      {lesson.type === "quiz" && <HelpCircle className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {lessonProgress[lesson.id] && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Completed" />
                      )}
                      {lesson.is_locked && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" title="Locked" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quiz Section (per lesson) */}
          {selectedLesson?.quiz_id && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <h3 className="font-semibold text-sm sm:text-base">
                    {quizData ? `Quiz: ${quizData.name}` : 'Quiz'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {quizData ? quizData.description : 'Loading the quiz for this lesson...'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizData && (
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between text-xs sm:text-sm gap-2">
                    <span>Questions: {quizData.questions.length}</span>
                    <span>Passing: {quizData.passing_score}%</span>
                    {quizData.time_limit_minutes && (
                      <span className="col-span-2 sm:col-span-1">Time: {quizData.time_limit_minutes} min</span>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleStartQuiz} 
                  className="w-full"
                  disabled={!user || quizLoading || !quizData || quizData.questions.length === 0}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {quizLoading ? 'Loading quiz...' : user ? 'Take Quiz' : 'Login to Start Quiz'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showQuiz && quizData && (
        <Dialog open={showQuiz} onOpenChange={(open) => {
          setShowQuiz(open);
          if (!open) resetQuiz();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                Quiz: {quizData.name}
              </DialogTitle>
              <DialogDescription>
                {quizData.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                ></div>
              </div>
              
              {/* Question Counter */}
              <div className="text-center text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </div>

              {/* Current Question */}
              {quizData.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {quizData.questions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="space-y-3">
                    {quizData.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name={`question-${quizData.questions[currentQuestionIndex].id}`}
                          value={optionIndex}
                          checked={quizAnswers[quizData.questions[currentQuestionIndex].id] === optionIndex}
                          onChange={() => handleQuizAnswer(quizData.questions[currentQuestionIndex].id, optionIndex)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {currentQuestionIndex === quizData.questions.length - 1 ? (
                    <Button 
                      onClick={() => {
                        const score = calculateQuizScore(quizAnswers, quizData.questions);
                        const passed = score >= quizData.passing_score;
                        setQuizScore(score);
                        setQuizCompleted(true);
                        handleQuizComplete(score, passed);
                        setShowQuiz(false);
                      }}
                      disabled={!quizAnswers[quizData.questions[currentQuestionIndex]?.id] && quizAnswers[quizData.questions[currentQuestionIndex]?.id] !== 0}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={quizAnswers[quizData.questions[currentQuestionIndex]?.id] === undefined}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
