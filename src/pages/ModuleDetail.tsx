import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);

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

      // Fetch quiz data if module has a quiz
      if (module.quiz_id) {
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', module.quiz_id)
          .eq('is_published', true)
          .single();

        if (quizError) {
          console.error('Error fetching quiz:', quizError);
        } else {
          console.log('Quiz data:', quiz);
          // Transform the quiz data to match our interface
          const transformedQuiz: QuizData = {
            ...quiz,
            questions: quiz.questions as any as QuizQuestion[]
          };
          setQuizData(transformedQuiz);
        }
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
    if (!quizData) return;
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizCompleted(false);
    setShowQuizResults(false);
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !user || !moduleData) return;

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quizData.questions.length;

    quizData.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quizData.passing_score;

    setQuizScore(score);
    setQuizCompleted(true);
    setShowQuizResults(true);

    try {
      // Record quiz attempt
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizData.id,
          module_id: moduleData.id,
          answers: quizAnswers,
          score: score,
          passed: passed,
          completed_at: new Date().toISOString()
        });

      if (attemptError) {
        console.error('Error recording quiz attempt:', attemptError);
      }

      // Update module progress with quiz score
      const { error: progressError } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleData.id,
          quiz_score: score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (progressError) {
        console.error('Error updating module progress:', progressError);
      }

      toast({
        title: passed ? "Quiz Passed!" : "Quiz Failed",
        description: `You scored ${score}%. ${passed ? 'Congratulations!' : 'Try again to improve your score.'}`,
        variant: passed ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz results",
        variant: "destructive"
      });
    }
  };

  const fetchQuizAttempts = async (lessonId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleData?.id)
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

  const updateModuleProgress = async () => {
    if (!user || !moduleData) return;

    try {
      // Count completed lessons for this module
      const result = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('module_id', moduleData.id)
        .eq('is_completed', true);

      if (result.error) throw result.error;
      const completedLessons = result.data;

      const completedCount = completedLessons?.length || 0;
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

    } catch (error) {
      console.error('Error updating module progress:', error);
    }
  };

  const handleLessonComplete = async () => {
    if (!selectedLesson || !user) return;

    try {
      // Mark lesson as completed in user progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: selectedLesson.id,
          module_id: selectedLesson.module_id,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update module progress
      await updateModuleProgress();

      // Update local state
      setLessonCompleted(true);
      
      // Update lesson progress map
      setLessonProgress(prev => ({
        ...prev,
        [selectedLesson.id]: true
      }));

      toast({
        title: "Lesson Completed!",
        description: "Great job! You've completed this lesson.",
      });

      // If lesson has a quiz, show quiz option
      if (selectedLesson.quiz_id) {
        toast({
          title: "Quiz Available",
          description: "Take the quiz to test your knowledge!",
        });
      }

    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive"
      });
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

      toast({
        title: passed ? "Quiz Passed!" : "Quiz Failed",
        description: `You scored ${score}%. ${passed ? 'Congratulations!' : 'Try again to improve your score.'}`,
        variant: passed ? "default" : "destructive"
      });

      // Refresh quiz attempts
      if (selectedLesson?.quiz_id) {
        const attempts = await fetchQuizAttempts(selectedLesson.id);
        setQuizAttempts(attempts);
      }

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
    setShowQuizResults(false);
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

  const handleRetakeQuiz = () => {
    resetQuiz();
    setShowQuiz(true);
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
            <div className="prose max-w-none">
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {lesson.text_content}
              </div>
            </div>
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
              <p className="text-muted-foreground mb-4">
                {lesson.text_content || 'Document content'}
              </p>
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
        <div className="prose max-w-none">
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {lesson.text_content || 'No content available'}
          </div>
        </div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Module Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {getCategoryIcon(moduleData.category)}
                <h2 className="text-xl font-semibold">Course Content</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {moduleData.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Lesson Content */}
          {selectedLesson && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedLesson.type === "video" && <Video className="h-5 w-5 text-red-500" />}
                    {selectedLesson.type === "text" && <FileText className="h-5 w-5 text-blue-500" />}
                    {selectedLesson.type === "quiz" && <HelpCircle className="h-5 w-5 text-purple-500" />}
                    <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                  </div>
                  <Badge variant="outline">{selectedLesson.duration_minutes} min</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderLessonContent(selectedLesson)}
              </CardContent>
            </Card>
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
                <Badge variant="outline" className="text-xs">{moduleData.level}</Badge>
                <Badge variant="outline" className="text-xs">{moduleData.category}</Badge>
                <Badge variant="outline" className="text-xs">{moduleData.price}</Badge>
              </div>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{moduleData.duration_weeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span>{moduleData.estimated_duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{moduleData.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span>{moduleData.difficulty_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{moduleData.status}</span>
                </div>
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
                    onClick={async () => {
                      console.log('Lesson clicked:', lesson)
                      setSelectedLesson(lesson)
                      setShowLessonModal(true)
                      setLessonCompleted(lessonProgress[lesson.id] || false)
                      
                      // Fetch quiz attempts if lesson has a quiz
                      if (lesson.quiz_id) {
                        const attempts = await fetchQuizAttempts(lesson.id);
                        setQuizAttempts(attempts);
                      } else {
                        setQuizAttempts([]);
                      }
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

          {/* Quiz Section */}
          {quizData && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <h3 className="font-semibold text-sm sm:text-base">Quiz: {quizData.name}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{quizData.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between text-xs sm:text-sm gap-2">
                  <span>Questions: {quizData.questions.length}</span>
                  <span>Passing: {quizData.passing_score}%</span>
                  {quizData.time_limit_minutes && (
                    <span className="col-span-2 sm:col-span-1">Time: {quizData.time_limit_minutes} min</span>
                  )}
                </div>
                
                {!showQuiz ? (
                  <Button 
                    onClick={handleStartQuiz} 
                    className="w-full"
                    disabled={!user}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {user ? 'Start Quiz' : 'Login to Start Quiz'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {!showQuizResults ? (
                      <div className="space-y-4">
                        {quizData.questions.map((question, index) => (
                          <div key={question.id} className="border rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium mb-3 text-sm sm:text-base leading-tight">
                              {index + 1}. {question.question}
                            </h4>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex items-start gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={optionIndex}
                                    checked={quizAnswers[question.id] === optionIndex}
                                    onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                    className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSubmitQuiz}
                            className="flex-1"
                            disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
                          >
                            Submit Quiz
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowQuiz(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
                          <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                            {quizScore}%
                          </div>
                          <div className="text-base sm:text-lg font-medium mb-2">
                            {quizScore && quizScore >= quizData.passing_score ? 'Quiz Passed!' : 'Quiz Failed'}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {quizScore && quizScore >= quizData.passing_score 
                              ? 'Congratulations! You have successfully completed the quiz.'
                              : `You need ${quizData.passing_score}% to pass. Try again to improve your score.`
                            }
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm sm:text-base">Review Answers:</h4>
                          {quizData.questions.map((question, index) => {
                            const userAnswer = quizAnswers[question.id];
                            const isCorrect = userAnswer === question.correctAnswer;
                            return (
                              <div key={question.id} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <h5 className="font-medium text-xs sm:text-sm leading-tight flex-1">
                                    {index + 1}. {question.question}
                                  </h5>
                                  <div className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs sm:text-sm">
                                  <div className="text-muted-foreground">
                                    <span className="font-medium">Your answer:</span> {userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                                  </div>
                                  <div className="text-muted-foreground">
                                    <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                                  </div>
                                  <div className="text-muted-foreground italic leading-relaxed">
                                    {question.explanation}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleRetakeQuiz}
                            className="flex-1"
                          >
                            Retake Quiz
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowQuiz(false)}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lesson Modal */}
      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedLesson?.type === "video" && <Video className="h-5 w-5 text-red-500" />}
              {selectedLesson?.type === "text" && <FileText className="h-5 w-5 text-blue-500" />}
              {selectedLesson?.type === "quiz" && <HelpCircle className="h-5 w-5 text-purple-500" />}
              {selectedLesson?.title}
            </DialogTitle>
            <DialogDescription>
              Duration: {selectedLesson?.duration_minutes} minutes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Lesson Content */}
            {selectedLesson && renderLessonContent(selectedLesson)}
            
            {/* Lesson Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
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
              
              <div className="flex items-center gap-2">
                {!lessonCompleted && (
                  <Button 
                    onClick={handleLessonComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Complete
                  </Button>
                )}
                
                {lessonCompleted && (
                  <Button 
                    disabled
                    className="bg-green-600 opacity-75"
                  >
                    ✓ Completed
                  </Button>
                )}
                
                {selectedLesson?.quiz_id && (
                  <Button 
                    onClick={() => {
                      resetQuiz();
                      setShowQuiz(true);
                    }}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowLessonModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            {/* Quiz Attempts History */}
            {selectedLesson?.quiz_id && quizAttempts.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Quiz Attempts History</h3>
                <div className="space-y-3">
                  {quizAttempts.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">
                            Attempt #{index + 1}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.completed_at).toLocaleDateString()} at {new Date(attempt.completed_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
