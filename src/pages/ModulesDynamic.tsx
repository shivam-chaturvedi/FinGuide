import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen,
  Target,
  TrendingUp,
  DollarSign,
  Trophy,
  Star,
  ArrowRight,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Bookmark,
  AlertCircle,
  Play,
  Download
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  content: {
    videoUrl?: string;
    textContent?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    quizQuestions?: QuizQuestion[];
  };
  isCompleted: boolean;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  rating: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'basics' | 'management' | 'remittance' | 'advanced';
  progress: number;
  status: 'completed' | 'in-progress' | 'locked' | 'not-started';
  price: string;
  thumbnail: string;
  whatYoullLearn: string[];
  prerequisites: string[];
  quizScore?: number;
  quiz_id?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  video_url?: string;
  lessons: Lesson[];
}

export default function ModulesDynamic() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumModule, setSelectedPremiumModule] = useState<Module | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  const categories = [
    { id: "all", label: "All Courses", icon: BookOpen },
    { id: "basics", label: "Basics", icon: Target },
    { id: "management", label: "Savings", icon: TrendingUp },
    { id: "remittance", label: "Remittances", icon: DollarSign },
    { id: "advanced", label: "Advanced", icon: Trophy },
  ];

  // Load modules from Supabase
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setLoading(true);
        loadModules();
        loadUserProgress();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const loadModules = async () => {
    try {
      console.log('=== LOADING MODULES FROM SUPABASE ===');
      console.log('User:', user);
      console.log('Auth loading:', authLoading);

      // Fetch modules from Supabase
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      

      console.log('Supabase modules data:', modulesData);
      console.log('Supabase modules error:', modulesError);

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        throw modulesError;
      }

      // Transform data to match the UI interface
      const transformedModules: Module[] = (modulesData || []).map(module => ({
        id: module.id,
        title: module.title,
        description: module.description || '',
        rating: module.rating || 4.0,
        duration: module.duration_weeks ? `${module.duration_weeks} weeks` : '1 week',
        level: module.level || 'Beginner',
        category: module.category || 'basics',
        progress: 0, // Will be updated with user progress
        status: 'not-started' as const, // Will be updated with user progress
        price: module.price || 'Free',
        thumbnail: module.thumbnail || module.title.substring(0, 2).toUpperCase(),
        whatYoullLearn: module.what_youll_learn || [],
        prerequisites: module.prerequisites || [],
        quizScore: undefined, // Will be updated with user progress
        quiz_id: module.quiz_id,
        file_url: module.file_url,
        file_name: module.file_name,
        file_size: module.file_size,
        file_type: module.file_type,
        video_url: module.video_url,
        lessons: [] // Empty lessons array since we're not fetching them here
      }));

      console.log('Transformed modules:', transformedModules);
      console.log('Number of modules:', transformedModules.length);

      // If no modules found, create some sample data for testing
      if (transformedModules.length === 0) {
        console.log('No modules found in database, creating sample data...');
        const sampleModules: Module[] = [
          {
            id: 'sample-1',
            title: 'Financial Basics',
            description: 'Learn the fundamentals of personal finance and money management.',
            rating: 4.5,
            duration: '2 weeks',
            level: 'Beginner',
            category: 'basics',
            progress: 0,
            status: 'not-started',
            price: 'Free',
            thumbnail: 'FB',
            whatYoullLearn: ['Budgeting', 'Saving', 'Basic investing'],
            prerequisites: [],
            quizScore: undefined,
            quiz_id: undefined,
            file_url: undefined,
            file_name: undefined,
            file_size: undefined,
            file_type: undefined,
            video_url: undefined,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Introduction to Personal Finance',
                type: 'text',
                duration: '10 min',
                content: {
                  textContent: 'Welcome to the world of personal finance! In this lesson, you will learn the basic concepts that will help you manage your money effectively.',
                  videoUrl: undefined,
                  file_url: undefined,
                  file_name: undefined,
                  file_size: undefined,
                  file_type: undefined,
                  quizQuestions: undefined
                },
                isCompleted: false,
                isLocked: false
              }
            ]
          },
          {
            id: 'sample-2',
            title: 'Savings Strategies',
            description: 'Discover effective strategies to build your savings and achieve financial goals.',
            rating: 4.2,
            duration: '3 weeks',
            level: 'Intermediate',
            category: 'management',
            progress: 0,
            status: 'not-started',
            price: 'Free',
            thumbnail: 'SS',
            whatYoullLearn: ['Emergency funds', 'Goal setting', 'Investment basics'],
            prerequisites: ['Financial Basics'],
            quizScore: undefined,
            quiz_id: undefined,
            file_url: undefined,
            file_name: undefined,
            file_size: undefined,
            file_type: undefined,
            video_url: undefined,
            lessons: []
          }
        ];
        setModules(sampleModules);
      } else {
        setModules(transformedModules as Module[]);
      }

    } catch (error) {
      console.error('Error loading modules:', error);
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive"
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      // Load module progress
      const { data: moduleProgress, error: moduleProgressError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id);

      if (moduleProgressError) throw moduleProgressError;

      // Load lesson progress
      const { data: lessonProgress, error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (lessonProgressError) throw lessonProgressError;

      // Create progress maps
      const moduleProgressMap = (moduleProgress || []).reduce((acc, progress) => {
        acc[progress.module_id] = progress;
        return acc;
      }, {} as Record<string, any>);

      const lessonProgressMap = (lessonProgress || []).reduce((acc, progress) => {
        acc[progress.lesson_id] = progress;
        return acc;
      }, {} as Record<string, any>);

      // Update modules with user progress
      setModules(prevModules =>
        prevModules.map(module => {
          const progress = moduleProgressMap[module.id];
          if (progress) {
            return {
              ...module,
              progress: progress.progress || 0,
              status: progress.status || 'not-started',
              quizScore: progress.quiz_score
            };
          }
          return module;
        }).map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => {
            const lessonProgress = lessonProgressMap[lesson.id];
            if (lessonProgress) {
              return {
                ...lesson,
                isCompleted: lessonProgress.is_completed || false
              };
            }
            return lesson;
          })
        }))
      );

      setUserProgress({ moduleProgressMap, lessonProgressMap });
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const VideoPlayer = ({ videoUrl, title }: { videoUrl: string; title: string }) => (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {videoUrl ? (
        <video
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
        </video>
      ) : (
        <div className="h-full flex items-center justify-center text-white">
          <div className="text-center">
            <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
            <p className="text-lg font-medium">{title}</p>
            <p className="text-sm opacity-75">Video not available</p>
          </div>
        </div>
      )}
    </div>
  );

  const DocumentViewer = ({ lesson }: { lesson: Lesson }) => {
    if (lesson.content.file_url) {
      const fileType = lesson.content.file_url.split('.').pop()?.toLowerCase();
      const mimeType = lesson.content.file_type?.split('/')[0];

      if (fileType === 'pdf' || mimeType === 'application') {
        return (
          <div className="w-full space-y-4">
            <div className="h-96 border rounded-lg">
              <iframe
                src={lesson.content.file_url}
                className="w-full h-full"
                title={lesson.title}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">{lesson.content.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.content.file_type} • {lesson.content.file_size ? Math.round(lesson.content.file_size / 1024) + ' KB' : 'Unknown size'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.content.file_url, '_blank')}
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
          <div className="w-full space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={lesson.content.file_url}
                alt={lesson.title}
                className="max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{lesson.content.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.content.file_type} • {lesson.content.file_size ? Math.round(lesson.content.file_size / 1024) + ' KB' : 'Unknown size'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.content.file_url, '_blank')}
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
                {lesson.content.textContent || 'Document content'}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{lesson.content.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.content.file_type} • {lesson.content.file_size ? Math.round(lesson.content.file_size / 1024) + ' KB' : 'Unknown size'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(lesson.content.file_url, '_blank')}
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
      <div className="space-y-4">
        <div className="prose max-w-none">
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {lesson.content.textContent || 'No content available'}
          </div>
        </div>
        {lesson.content.textContent && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Content type: Text</p>
          </div>
        )}
      </div>
    );
  };

  const QuizComponent = ({ lesson }: { lesson: Lesson }) => {
    if (!lesson.content.quizQuestions) return null;

    if (showQuizResults) {
      const correctAnswers = lesson.content.quizQuestions.filter(
        (q) => quizAnswers[q.id] === q.correctAnswer
      ).length;
      const score = (correctAnswers / lesson.content.quizQuestions.length) * 100;
      const passed = score >= 80;

      return (
        <div className="space-y-6">
          <Card className={`p-6 ${passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                {passed ? 'Congratulations! You Passed!' : 'Try Again'}
              </h3>
              <p className="text-muted-foreground mb-4">
                You got {correctAnswers} out of {lesson.content.quizQuestions.length} questions correct.
              </p>
              {passed && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    Great job! This course is now unlocked for you.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            {lesson.content.quizQuestions.map((question, index) => {
              const userAnswer = quizAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <Card key={question.id} className={`p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <h4 className="font-semibold mb-3">
                    Question {index + 1}: {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-3 p-2 rounded ${optionIndex === question.correctAnswer
                            ? 'bg-green-100 border border-green-300'
                            : userAnswer === optionIndex
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-gray-50'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 ${optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-500'
                            : userAnswer === optionIndex
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300'
                          }`} />
                        <span className={`text-sm ${optionIndex === question.correctAnswer
                            ? 'text-green-800 font-medium'
                            : userAnswer === optionIndex
                              ? 'text-red-800 font-medium'
                              : 'text-gray-700'
                          }`}>
                          {option}
                        </span>
                        {optionIndex === question.correctAnswer && (
                          <span className="text-green-600 text-sm font-medium ml-auto">✓ Correct</span>
                        )}
                        {userAnswer === optionIndex && optionIndex !== question.correctAnswer && (
                          <span className="text-red-600 text-sm font-medium ml-auto">✗ Your Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowQuizResults(false);
                setQuizAnswers({});
              }}
              variant="outline"
            >
              Retake Quiz
            </Button>
            <Button
              onClick={() => {
                setSelectedModule(null);
                setCurrentLesson(null);
              }}
            >
              Back to Courses
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {lesson.content.quizQuestions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <h4 className="font-semibold mb-3">
                Question {index + 1}: {question.question}
              </h4>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={quizAnswers[question.id] === optionIndex}
                      onChange={() => setQuizAnswers(prev => ({
                        ...prev,
                        [question.id]: optionIndex
                      }))}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleQuizSubmit(lesson)}
            disabled={Object.keys(quizAnswers).length !== lesson.content.quizQuestions.length}
            className="flex-1"
          >
            Submit Quiz
          </Button>
          <Button
            onClick={() => setQuizAnswers({})}
            variant="outline"
          >
            Clear Answers
          </Button>
        </div>
      </div>
    );
  };

  const filteredModules = selectedCategory === "all"
    ? modules
    : modules.filter(module => module.category === selectedCategory);


  if (selectedModule && currentLesson) {
    return (
      <div className="p-4 space-y-6">
        {/* Course Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedModule(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedModule.title}</h1>
            <p className="text-muted-foreground">{selectedModule.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Lesson */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentLesson.type === "video" && <Video className="h-5 w-5 text-red-500" />}
                    {currentLesson.type === "text" && <FileText className="h-5 w-5 text-blue-500" />}
                    {currentLesson.type === "quiz" && <HelpCircle className="h-5 w-5 text-purple-500" />}
                    <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
                  </div>
                  <Badge variant="outline">{currentLesson.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentLesson.type === "video" && (
                  <VideoPlayer
                    videoUrl={currentLesson.content.videoUrl || ""}
                    title={currentLesson.title}
                  />
                )}

                {currentLesson.type === "text" && (
                  <DocumentViewer lesson={currentLesson} />
                )}

                {currentLesson.type === "quiz" && (
                  <QuizComponent lesson={currentLesson} />
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleLessonComplete(currentLesson)}
                    className="flex-1"
                    disabled={currentLesson.isCompleted}
                  >
                    {currentLesson.isCompleted ? "Completed" : "Complete Lesson"}
                  </Button>

                  {/* Previous Lesson Button */}
                  {selectedModule.lessons.findIndex(l => l.id === currentLesson.id) > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = selectedModule.lessons.findIndex(l => l.id === currentLesson.id);
                        const prevLesson = selectedModule.lessons[currentIndex - 1];
                        if (prevLesson && !prevLesson.isLocked) {
                          setCurrentLesson(prevLesson);
                        }
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  {/* Next Lesson Button */}
                  {selectedModule.lessons.findIndex(l => l.id === currentLesson.id) < selectedModule.lessons.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = selectedModule.lessons.findIndex(l => l.id === currentLesson.id);
                        const nextLesson = selectedModule.lessons[currentIndex + 1];
                        if (nextLesson && !nextLesson.isLocked) {
                          setCurrentLesson(nextLesson);
                        }
                      }}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}

                  <Button variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Overview */}
          <div className="space-y-4">
            {/* Module Information */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedModule.level}</Badge>
                  <Badge variant="outline">{selectedModule.category}</Badge>
                  <Badge variant="outline">{selectedModule.price}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{selectedModule.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{selectedModule.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span>{selectedModule.progress}%</span>
                  </div>
                </div>

                {selectedModule.whatYoullLearn && selectedModule.whatYoullLearn.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">What you'll learn:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {selectedModule.whatYoullLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedModule.prerequisites && selectedModule.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {selectedModule.prerequisites.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Module Files */}
                {selectedModule.file_url && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Course Materials</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedModule.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedModule.file_type} • {selectedModule.file_size ? Math.round(selectedModule.file_size / 1024) + ' KB' : 'Unknown size'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedModule.file_url, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Module Video */}
                {selectedModule.video_url && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Course Video</h4>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        <source src={selectedModule.video_url} type="video/mp4" />
                        <source src={selectedModule.video_url} type="video/webm" />
                        <source src={selectedModule.video_url} type="video/ogg" />
                      </video>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Content</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedModule.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${lesson.id === currentLesson.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-gray-50'
                      }`}
                    onClick={() => !lesson.isLocked && setCurrentLesson(lesson)}
                  >
                    <div className="flex-shrink-0">
                      {lesson.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                      {lesson.type === "text" && <FileText className="h-4 w-4 text-blue-500" />}
                      {lesson.type === "quiz" && <HelpCircle className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {lesson.isCompleted && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {lesson.isLocked && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                      {lesson.content.file_type && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.content.file_type.split('/')[1] || 'file'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleStartModule = (module: Module) => {
    if (module.status === "locked" || !user) return;
    console.log(module)

    // Navigate to module detail page
    navigate(`/dashboard/modules/${module.id}`);
  };

  const handleLessonComplete = async (lesson: Lesson) => {
    if (!user || !selectedModule) return;

    try {
      // Mark lesson as completed
      const { error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          is_completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (lessonProgressError) throw lessonProgressError;

      // Update module progress
      const completedLessons = selectedModule.lessons.filter(l => l.isCompleted || l.id === lesson.id).length;
      const totalLessons = selectedModule.lessons.length;
      const newProgress = Math.round((completedLessons / totalLessons) * 100);
      const newStatus = newProgress === 100 ? 'completed' : 'in-progress';

      const { error: moduleProgressError } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: selectedModule.id,
          progress: newProgress,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (moduleProgressError) throw moduleProgressError;

      // Update local state
      setModules(prevModules =>
        prevModules.map(m =>
          m.id === selectedModule.id
            ? { ...m, progress: newProgress, status: newStatus }
            : m
        )
      );

      setSelectedModule(prev => prev ? { ...prev, progress: newProgress, status: newStatus } : null);

      toast({
        title: "Lesson Completed!",
        description: "Great job! Keep up the good work.",
      });

      // Auto-advance to next lesson
      const currentIndex = selectedModule.lessons.findIndex(l => l.id === lesson.id);
      const nextLesson = selectedModule.lessons[currentIndex + 1];

      if (nextLesson && !nextLesson.isLocked) {
        setCurrentLesson(nextLesson);
      } else if (newStatus === 'completed') {
        toast({
          title: "Course Completed!",
          description: "Congratulations! You've completed this course.",
        });
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to complete lesson",
        variant: "destructive"
      });
    }
  };

  const handleQuizSubmit = async (lesson: Lesson) => {
    if (!lesson.content.quizQuestions || !user || !selectedModule) return;

    try {
      const correctAnswers = lesson.content.quizQuestions.filter(
        (q) => quizAnswers[q.id] === q.correctAnswer
      ).length;
      const score = (correctAnswers / lesson.content.quizQuestions.length) * 100;
      const passed = score >= 80;

      // Save quiz attempt
      const { error: quizAttemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: selectedModule.quiz_id,
          module_id: selectedModule.id,
          answers: quizAnswers,
          score: score,
          passed: passed,
          completed_at: new Date().toISOString()
        });

      if (quizAttemptError) throw quizAttemptError;

      // Update lesson progress with quiz results
      const { error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          is_completed: true,
          quiz_answers: quizAnswers,
          quiz_score: score,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (lessonProgressError) throw lessonProgressError;

      // Update module progress if quiz passed
      if (passed) {
        const { error: moduleProgressError } = await supabase
          .from('user_module_progress')
          .upsert({
            user_id: user.id,
            module_id: selectedModule.id,
            quiz_score: score,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,module_id'
          });

        if (moduleProgressError) throw moduleProgressError;
      }

      // Update local state
      setModules(prevModules =>
        prevModules.map(m =>
          m.id === selectedModule.id
            ? { ...m, quizScore: passed ? score : m.quizScore }
            : m
        )
      );

      setShowQuizResults(true);

      toast({
        title: passed ? "Quiz Passed!" : "Quiz Failed",
        description: passed
          ? `Great job! You scored ${score.toFixed(1)}%`
          : `You scored ${score.toFixed(1)}%. Try again!`,
        variant: passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
    }
  };

  // Early returns after all hooks are called
  if (!user) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <Alert>
            <AlertDescription>
              Please log in to access the learning modules.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading Learning Modules</p>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we fetch your courses...</p>
        </div>
        
        {/* Loading skeleton for modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg border shadow-card animate-pulse">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-muted rounded-full"></div>
                  <div className="h-5 w-20 bg-muted rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="h-4 w-8 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Learning Modules
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master financial literacy with our comprehensive courses designed for migrant workers
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No Modules Available</h3>
          <p className="text-muted-foreground mb-4">
            There are no learning modules available at the moment.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or contact admin to add modules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="group hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                <div className="text-4xl font-bold text-primary">
                  {module.thumbnail}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{module.category}</Badge>
                  <Badge variant="outline">{module.level}</Badge>
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {module.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{module.rating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {module.duration}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    disabled={module.status === "locked"}
                    variant={module.status === "completed" ? "secondary" : "default"}
                    onClick={() => handleStartModule(module)}
                  >
                    {module.status === "completed" ? "Review Course" :
                      module.status === "in-progress" ? "Continue Learning" :
                        module.status === "locked" ? "Locked" : "Start Course"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  {module.status === "in-progress" && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Premium Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium Course</DialogTitle>
            <DialogDescription>
              This is a premium course. Please contact admin for access.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPremiumModule && (
              <div className="space-y-4">
                <h3 className="font-semibold">{selectedPremiumModule.title}</h3>
                <p className="text-muted-foreground">{selectedPremiumModule.description}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Premium Access Required</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-2">
                    Contact admin for premium access or payment options
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}