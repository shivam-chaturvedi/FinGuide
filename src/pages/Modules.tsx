import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Play,
  Video,
  FileText,
  HelpCircle,
  Award,
  Users,
  Star,
  ArrowRight,
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  Trophy,
  Target,
  Zap,
  Shield,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// Enhanced interfaces for Coursera-like experience
interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  duration: string;
  content: {
    videoUrl?: string;
    textContent?: string;
    quizQuestions?: QuizQuestion[];
  };
  isCompleted: boolean;
  isLocked: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  rating: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: "basics" | "management" | "remittance" | "advanced";
  progress: number;
  status: "completed" | "in-progress" | "locked" | "not-started";
  lessons: Lesson[];
  price: "Free" | "Premium";
  thumbnail: string;
  whatYoullLearn: string[];
  prerequisites: string[];
  quizScore?: number;
}

// Comprehensive course data
const modules: Module[] = [
  {
    id: "1",
    title: "Financial Basics for Migrant Workers",
    description: "Master the fundamentals of personal finance, budgeting, and money management specifically designed for migrant workers in Singapore.",
    rating: 4.8,
    duration: "4 weeks",
    level: "Beginner",
    category: "basics",
    progress: 100,
    status: "completed",
    price: "Free",
    thumbnail: "Financial Basics",
    whatYoullLearn: [
      "Understand Singapore's financial system",
      "Create and maintain a personal budget",
      "Learn about banking and savings accounts",
      "Understand basic investment concepts"
    ],
    prerequisites: ["Basic English", "Singapore work permit"],
    quizScore: 85,
    lessons: [
      {
        id: "1-1",
        title: "Welcome to Financial Literacy",
        type: "video",
        duration: "5 min",
        content: {
          videoUrl: "https://example.com/video1",
          textContent: "Introduction to financial literacy for migrant workers"
        },
        isCompleted: true,
        isLocked: false
      },
      {
        id: "1-2",
        title: "Understanding Singapore's Banking System",
        type: "video",
        duration: "12 min",
        content: {
          videoUrl: "https://example.com/video2",
          textContent: "Learn about local banks, ATMs, and digital banking"
        },
        isCompleted: true,
        isLocked: false
      },
      {
        id: "1-3",
        title: "Creating Your First Budget",
        type: "text",
        duration: "8 min",
        content: {
          textContent: "Step-by-step guide to creating a monthly budget that works for your income and expenses in Singapore."
        },
        isCompleted: true,
        isLocked: false
      },
      {
        id: "1-4",
        title: "Budgeting Quiz",
        type: "quiz",
        duration: "5 min",
        content: {
          quizQuestions: [
            {
              id: "q1",
              question: "What percentage of your income should go to savings?",
              options: ["10-15%", "20-30%", "5-10%", "40-50%"],
              correctAnswer: 0,
              explanation: "Financial experts recommend saving 10-15% of your income for emergencies and future goals."
            },
            {
              id: "q2",
              question: "Which expense should be prioritized in your budget?",
              options: ["Entertainment", "Rent and utilities", "Shopping", "Dining out"],
              correctAnswer: 1,
              explanation: "Rent and utilities are essential expenses that should be prioritized to maintain stable housing."
            }
          ]
        },
        isCompleted: true,
        isLocked: false
      }
    ]
  },
  {
    id: "2",
    title: "Smart Savings & Investment Strategies",
    description: "Learn how to save money effectively and make your money work for you through safe investment options.",
    rating: 4.7,
    duration: "3 weeks",
    level: "Intermediate",
    category: "management",
    progress: 60,
    status: "in-progress",
    price: "Free",
    thumbnail: "Savings & Investment",
    whatYoullLearn: [
      "Build emergency funds",
      "Understand different savings accounts",
      "Learn about safe investment options",
      "Plan for retirement"
    ],
    prerequisites: ["Completed Financial Basics", "Basic math skills"],
    quizScore: 72,
    lessons: [
      {
        id: "2-1",
        title: "Emergency Fund Essentials",
        type: "video",
        duration: "10 min",
        content: {
          videoUrl: "https://example.com/video3",
          textContent: "Why you need an emergency fund and how to build one"
        },
        isCompleted: true,
        isLocked: false
      },
      {
        id: "2-2",
        title: "Types of Savings Accounts in Singapore",
        type: "text",
        duration: "12 min",
        content: {
          textContent: "Compare different savings accounts, interest rates, and find the best option for your needs."
        },
        isCompleted: true,
        isLocked: false
      },
      {
        id: "2-3",
        title: "Introduction to Safe Investments",
        type: "video",
        duration: "15 min",
        content: {
          videoUrl: "https://example.com/video4",
          textContent: "Learn about CPF, fixed deposits, and other low-risk investment options"
        },
        isCompleted: false,
        isLocked: false
      },
      {
        id: "2-4",
        title: "Savings Strategy Quiz",
        type: "quiz",
        duration: "8 min",
        content: {
          quizQuestions: [
            {
              id: "q3",
              question: "How many months of expenses should your emergency fund cover?",
              options: ["1-2 months", "3-6 months", "12 months", "2 years"],
              correctAnswer: 1,
              explanation: "An emergency fund should cover 3-6 months of essential expenses to provide financial security."
            }
          ]
        },
        isCompleted: false,
        isLocked: false
      }
    ]
  },
  {
    id: "3",
    title: "Safe Remittances & Money Transfers",
    description: "Master the art of sending money home safely, affordably, and efficiently using various remittance services.",
    rating: 4.9,
    duration: "2 weeks",
    level: "Beginner",
    category: "remittance",
    progress: 0,
    status: "locked",
    price: "Premium",
    thumbnail: "Remittances",
    whatYoullLearn: [
      "Compare remittance providers",
      "Understand exchange rates and fees",
      "Learn about regulations and safety",
      "Choose the best transfer method"
    ],
    prerequisites: ["Completed Financial Basics"],
    lessons: [
      {
        id: "3-1",
        title: "Understanding Remittance Options",
        type: "video",
        duration: "12 min",
        content: {
          videoUrl: "https://example.com/video5",
          textContent: "Overview of different money transfer services and their features"
        },
        isCompleted: false,
        isLocked: true
      },
      {
        id: "3-2",
        title: "Exchange Rates and Hidden Fees",
        type: "text",
        duration: "10 min",
        content: {
          textContent: "Learn how to identify hidden fees and get the best exchange rates for your transfers."
        },
        isCompleted: false,
        isLocked: true
      },
      {
        id: "3-3",
        title: "Safety and Security in Money Transfers",
        type: "video",
        duration: "8 min",
        content: {
          videoUrl: "https://example.com/video6",
          textContent: "Important safety tips and red flags to avoid when sending money"
        },
        isCompleted: false,
        isLocked: true
      },
      {
        id: "3-4",
        title: "Remittance Quiz",
        type: "quiz",
        duration: "6 min",
        content: {
          quizQuestions: [
            {
              id: "q4",
              question: "What should you check before choosing a remittance service?",
              options: ["Only the exchange rate", "Fees, exchange rate, and security", "Only the speed", "Only the convenience"],
              correctAnswer: 1,
              explanation: "Always compare fees, exchange rates, and security features to get the best value and safety."
            }
          ]
        },
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: "4",
    title: "Advanced Financial Planning",
    description: "Take your financial knowledge to the next level with advanced planning, investment strategies, and wealth building.",
    rating: 4.6,
    duration: "6 weeks",
    level: "Advanced",
    category: "advanced",
    progress: 0,
    status: "locked",
    price: "Premium",
    thumbnail: "Advanced Planning",
    whatYoullLearn: [
      "Advanced investment strategies",
      "Tax planning and optimization",
      "Retirement planning",
      "Building generational wealth"
    ],
    prerequisites: ["Completed all basic courses", "1+ years in Singapore"],
    lessons: [
      {
        id: "4-1",
        title: "Investment Portfolio Building",
        type: "video",
        duration: "20 min",
        content: {
          videoUrl: "https://example.com/video7",
          textContent: "Learn how to build a diversified investment portfolio"
        },
        isCompleted: false,
        isLocked: true
      }
    ]
  }
];

const categoryColors = {
  basics: "bg-blue-500/10 text-blue-600 border-blue-200",
  management: "bg-green-500/10 text-green-600 border-green-200",
  remittance: "bg-purple-500/10 text-purple-600 border-purple-200",
  advanced: "bg-orange-500/10 text-orange-600 border-orange-200"
};

const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-green-600" />,
  "in-progress": <Play className="h-5 w-5 text-blue-600" />,
  locked: <Lock className="h-5 w-5 text-gray-400" />,
  "not-started": <Play className="h-5 w-5 text-gray-600" />
};

export default function Modules() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumModule, setSelectedPremiumModule] = useState<Module | null>(null);

  const categories = [
    { id: "all", label: "All Courses", icon: BookOpen },
    { id: "basics", label: "Basics", icon: Target },
    { id: "management", label: "Savings", icon: TrendingUp },
    { id: "remittance", label: "Remittances", icon: DollarSign },
    { id: "advanced", label: "Advanced", icon: Trophy },
  ];

  const filteredModules = selectedCategory === "all"
    ? modules
    : modules.filter(module => module.category === selectedCategory);

  const handleStartModule = (module: Module) => {
    if (module.status === "locked") return;
    setSelectedModule(module);
    setCurrentLesson(module.lessons.find(l => !l.isCompleted && !l.isLocked) || module.lessons[0]);
  };

  const handleLessonComplete = (lesson: Lesson) => {
    // In a real app, this would update the database
    console.log(`Lesson ${lesson.id} completed`);
  };

  const handleQuizSubmit = (lesson: Lesson) => {
    if (!lesson.content.quizQuestions) return;

    const correctAnswers = lesson.content.quizQuestions.filter(
      (q, index) => quizAnswers[q.id] === q.correctAnswer
    ).length;

    const score = (correctAnswers / lesson.content.quizQuestions.length) * 100;
    setShowQuizResults(true);

    // Update module status if score is above 80%
    if (score >= 80 && selectedModule) {
      const updatedModules = modules.map(module => {
        if (module.id === selectedModule.id) {
          return {
            ...module,
            status: "in-progress" as const,
            quizScore: score
          };
        }
        return module;
      });
      // In a real app, this would update the database
      console.log(`Quiz score: ${score}% - Module unlocked!`);
    }

    console.log(`Quiz score: ${score}%`);
  };

  const handlePurchasePremium = (module: Module) => {
    setSelectedPremiumModule(module);
    setShowPremiumModal(true);
  };

  const confirmPremiumPurchase = () => {
    if (selectedPremiumModule) {
      // In a real app, this would handle payment processing
      console.log(`Purchasing premium access for module ${selectedPremiumModule.id}`);
      alert("Premium purchase feature coming soon! Contact admin for access.");
      setShowPremiumModal(false);
    }
  };

  const VideoPlayer = ({ videoUrl, title }: { videoUrl: string; title: string }) => (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm opacity-75">Video Player (Demo)</p>
          <p className="text-xs opacity-50 mt-2">URL: {videoUrl}</p>
        </div>
      </div>
    </div>
  );

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
                        className={`flex items-center space-x-3 p-2 rounded ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-100 border border-green-300'
                            : optionIndex === userAnswer && !isCorrect
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-500 border-green-500'
                            : optionIndex === userAnswer && !isCorrect
                            ? 'bg-red-500 border-red-500'
                            : 'border-gray-300'
                        }`} />
                        <span className="text-sm">{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <span className="text-green-600 text-xs font-medium">Correct Answer</span>
                        )}
                        {optionIndex === userAnswer && !isCorrect && (
                          <span className="text-red-600 text-xs font-medium">Your Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
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
              className="flex-1"
            >
              Retake Quiz
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedModule(null)}
            >
              Back to Courses
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {lesson.content.quizQuestions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <h4 className="font-semibold mb-4">
              Question {index + 1}: {question.question}
            </h4>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={optionIndex}
                    checked={quizAnswers[question.id] === optionIndex}
                    onChange={(e) => setQuizAnswers(prev => ({
                      ...prev,
                      [question.id]: parseInt(e.target.value)
                    }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        <div className="flex gap-3">
          <Button onClick={() => handleQuizSubmit(lesson)} className="flex-1">
            Submit Quiz
          </Button>
          <Button variant="outline" onClick={() => setQuizAnswers({})}>
            Clear Answers
          </Button>
        </div>
      </div>
    );
  };

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
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentLesson.content.textContent}
                    </p>
                  </div>
                )}

                {currentLesson.type === "quiz" && (
                  <QuizComponent lesson={currentLesson} />
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleLessonComplete(currentLesson)}
                    className="flex-1"
                  >
                    {currentLesson.isCompleted ? "Mark as Complete" : "Complete Lesson"}
                  </Button>
                  <Button variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Progress</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{selectedModule.progress}%</span>
                  </div>
                  <Progress value={selectedModule.progress} className="h-2" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedModule.lessons.filter(l => l.isCompleted).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedModule.lessons.filter(l => !l.isCompleted && !l.isLocked).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedModule.lessons.filter(l => l.type === "quiz").length}
                      </div>
                      <div className="text-sm text-muted-foreground">Quizzes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div className="space-y-4">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Details</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{selectedModule.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedModule.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedModule.level}</span>
                </div>
                <Badge className={categoryColors[selectedModule.category]}>
                  {selectedModule.category}
                </Badge>
                {selectedModule.quizScore && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      Quiz Score: {selectedModule.quizScore}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Course Content</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedModule.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${lesson.id === currentLesson.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                        } ${lesson.isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => !lesson.isLocked && setCurrentLesson(lesson)}
                    >
                      <div className="flex-shrink-0">
                        {lesson.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                        {lesson.type === "text" && <FileText className="h-4 w-4 text-blue-500" />}
                        {lesson.type === "quiz" && <HelpCircle className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                      </div>
                      <div className="flex-shrink-0">
                        {lesson.isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {lesson.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          {t('modules.title', 'Financial Learning Center')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('modules.subtitle', 'Master financial skills with video lessons, interactive content, and quizzes')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{modules.length}</div>
          <div className="text-sm text-muted-foreground">Courses</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-secondary">
            {modules.reduce((acc, m) => acc + m.lessons.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Lessons</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {modules.filter(m => m.status === "completed").length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap gap-2"
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow group">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{module.thumbnail}</div>
                  <div className="text-sm text-muted-foreground">Course Content</div>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={categoryColors[module.category]}>
                  {module.category}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                {statusIcons[module.status]}
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {module.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {module.price}
                </Badge>
              </div>

              <CardDescription className="line-clamp-2 mb-3">
                {module.description}
              </CardDescription>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{module.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{module.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{module.level}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Progress Bar */}
              {module.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              )}

              {/* Quiz Score */}
              {module.quizScore && (
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-green-600">Quiz Score: {module.quizScore}%</div>
                    <div className="text-xs text-muted-foreground">Last attempt</div>
                  </div>
                </div>
              )}

              {/* What You'll Learn */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">What you'll learn:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {module.whatYoullLearn.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {item}
                    </li>
                  ))}
                  {module.whatYoullLearn.length > 2 && (
                    <li className="text-xs text-muted-foreground">
                      +{module.whatYoullLearn.length - 2} more skills
                    </li>
                  )}
                </ul>
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
                
                {/* Quiz Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (module.status === "locked") {
                      handlePurchasePremium(module);
                    } else {
                      // Start quiz for this module
                      const quizLesson = module.lessons.find(l => l.type === "quiz");
                      if (quizLesson) {
                        setSelectedModule(module);
                        setCurrentLesson(quizLesson);
                      }
                    }
                  }}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {module.status === "locked" ? "Buy Premium Access" : "Take Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Purchase Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-500" />
              Premium Access Required
            </DialogTitle>
            <DialogDescription>
              This course requires premium access to unlock all content and features.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPremiumModule && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{selectedPremiumModule.thumbnail}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedPremiumModule.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPremiumModule.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{selectedPremiumModule.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={categoryColors[selectedPremiumModule.category]}>
                    {selectedPremiumModule.category}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">Premium</div>
                    <div className="text-xs text-muted-foreground">Full Access</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">What you'll get:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Full course access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Interactive quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Certificate of completion
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={confirmPremiumPurchase}
                  className="flex-1"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Purchase Premium
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPremiumModal(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Contact admin for premium access or payment options
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}