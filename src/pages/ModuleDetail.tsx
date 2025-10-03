import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    if (id) {
      loadModuleData();
    }
  }, [id]);

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
        setLessons(lessonsData || []);
        if (lessonsData && lessonsData.length > 0) {
          setSelectedLesson(lessonsData[0]);
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

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
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

  const handleRetakeQuiz = () => {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizCompleted(false);
    setShowQuizResults(false);
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
    if (lesson.type === 'video' && lesson.video_url) {
      return (
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

    return (
      <div className="prose max-w-none">
        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {lesson.text_content || 'No content available'}
        </div>
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

          {/* Module Video */}
          {moduleData.video_url && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Video</h3>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src={moduleData.video_url} type="video/mp4" />
                    <source src={moduleData.video_url} type="video/webm" />
                    <source src={moduleData.video_url} type="video/ogg" />
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Files */}
          {moduleData.file_url && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Materials</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{moduleData.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {moduleData.file_type} • {formatFileSize(moduleData.file_size || 0)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(moduleData.file_url, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
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
                    onClick={() => setSelectedLesson(lesson)}
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
                      {lesson.is_completed && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {lesson.is_locked && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
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
    </div>
  );
}
