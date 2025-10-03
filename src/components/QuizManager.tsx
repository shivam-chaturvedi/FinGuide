import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  name: string
  description: string | null
  questions: QuizQuestion[]
  passing_score: number
  time_limit_minutes: number | null
  is_published: boolean
  created_at: string
}

export default function QuizManager() {
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    name: '',
    description: '',
    passing_score: 80,
    time_limit_minutes: 15,
    is_published: false,
    questions: [] as QuizQuestion[]
  })

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  })

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuizzes(data || [])
    } catch (error) {
      console.error('Error loading quizzes:', error)
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizForm.name || quizForm.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a quiz name and at least one question",
        variant: "destructive"
      })
      return
    }

    try {
      const quizData = {
        name: quizForm.name,
        description: quizForm.description || null,
        questions: quizForm.questions,
        passing_score: quizForm.passing_score,
        time_limit_minutes: quizForm.time_limit_minutes || null,
        is_published: quizForm.is_published,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }

      if (editingQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', editingQuiz.id)

        if (error) throw error
        toast({
          title: "Success",
          description: "Quiz updated successfully"
        })
      } else {
        const { error } = await supabase
          .from('quizzes')
          .insert(quizData)

        if (error) throw error
        toast({
          title: "Success",
          description: "Quiz created successfully"
        })
      }

      // Reset form
      setQuizForm({
        name: '',
        description: '',
        passing_score: 80,
        time_limit_minutes: 15,
        is_published: false,
        questions: []
      })
      setCurrentQuestion({
        id: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      })
      setShowForm(false)
      setEditingQuiz(null)
      loadQuizzes()
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive"
      })
    }
  }

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "Please fill in the question and all options",
        variant: "destructive"
      })
      return
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: Date.now().toString()
    }

    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, newQuestion]
    })

    setCurrentQuestion({
      id: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    })
  }

  const handleRemoveQuestion = (questionId: string) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter(q => q.id !== questionId)
    })
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setQuizForm({
      name: quiz.name,
      description: quiz.description || '',
      passing_score: quiz.passing_score,
      time_limit_minutes: quiz.time_limit_minutes || 15,
      is_published: quiz.is_published,
      questions: quiz.questions
    })
    setShowForm(true)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Quiz deleted successfully"
      })

      loadQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive"
      })
    }
  }

  const toggleQuizPublish = async (quizId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !currentStatus })
        .eq('id', quizId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Quiz ${!currentStatus ? 'published' : 'unpublished'}`
      })

      loadQuizzes()
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading quizzes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-muted-foreground">Create and manage quizzes for your courses</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
            <CardDescription>
              {editingQuiz ? 'Update quiz details and questions' : 'Add a new quiz with questions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Quiz Name *</Label>
                  <Input
                    id="name"
                    value={quizForm.name}
                    onChange={(e) => setQuizForm({ ...quizForm, name: e.target.value })}
                    placeholder="e.g., Financial Basics Quiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing_score">Passing Score (%)</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 80 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="1"
                    value={quizForm.time_limit_minutes}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) || 15 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={quizForm.is_published}
                    onCheckedChange={(checked) => setQuizForm({ ...quizForm, is_published: checked })}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Brief description of the quiz..."
                  rows={3}
                />
              </div>

              {/* Add Question Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Add Question</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Enter the question..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options *</Label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options]
                          newOptions[index] = e.target.value
                          setCurrentQuestion({ ...currentQuestion, options: newOptions })
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer..."
                    rows={2}
                  />
                </div>

                <Button type="button" onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {quizForm.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Questions ({quizForm.questions.length})</h3>
                  {quizForm.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Q{index + 1}: {question.question}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`text-sm p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100'
                            }`}
                          >
                            {optionIndex + 1}. {option}
                            {optionIndex === question.correctAnswer && ' ✓'}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={quizForm.questions.length === 0}>
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingQuiz(null)
                    setQuizForm({
                      name: '',
                      description: '',
                      passing_score: 80,
                      time_limit_minutes: 15,
                      is_published: false,
                      questions: []
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{quiz.name}</h3>
                  <p className="text-muted-foreground mt-1">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant={quiz.is_published ? "default" : "secondary"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {quiz.questions.length} questions
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Passing: {quiz.passing_score}%
                    </span>
                    {quiz.time_limit_minutes && (
                      <span className="text-sm text-muted-foreground">
                        {quiz.time_limit_minutes} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleQuizPublish(quiz.id, quiz.is_published)}
                  >
                    {quiz.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

