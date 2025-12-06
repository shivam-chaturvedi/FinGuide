import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUploader from '@/components/FileUploader'
import { Plus, X, Video, FileText, HelpCircle, Edit } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const loadReactQuill = () => import('react-quill')

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  duration_minutes: number
  video_url?: string
  text_content?: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  quiz_id?: string
  order_index: number
}

interface Quiz {
  id: string
  name: string
  questions: any[]
  is_published: boolean
}

interface LessonCreatorProps {
  onLessonsChange: (lessons: Lesson[]) => void
  initialLessons?: Lesson[]
  quizzes?: Quiz[]
}

const createEmptyLessonTemplate = (orderIndex: number): Lesson => ({
  id: '',
  title: '',
  type: 'text',
  duration_minutes: 5,
  order_index: orderIndex
})

export default function LessonCreator({ onLessonsChange, initialLessons = [], quizzes = [] }: LessonCreatorProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [showForm, setShowForm] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState<any>(null)
  const [QuillEditor, setQuillEditor] = useState<any>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson>(createEmptyLessonTemplate(initialLessons.length + 1))
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [savingLesson, setSavingLesson] = useState(false)
  const [lessonSaveError, setLessonSaveError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Sync internal state with initialLessons prop
  const resetLessonFormState = (orderIndex: number) => {
    setCurrentLesson(createEmptyLessonTemplate(orderIndex))
    setUploadedVideo(null)
    setEditingLessonId(null)
    setLessonSaveError(null)
  }

  useEffect(() => {
    console.log('LessonCreator: initialLessons changed:', initialLessons)
    setLessons(initialLessons)
    resetLessonFormState(initialLessons.length + 1)
    setShowForm(false)
  }, [initialLessons])

  useEffect(() => {
    let mounted = true
    Promise.all([
      loadReactQuill(),
      import('react-quill/dist/quill.snow.css'),
    ]).then(([mod]) => {
      if (mounted) {
        setQuillEditor(() => mod.default)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  }), [])

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link',
  ], [])

  const handleVideoUploaded = (files: any[]) => {
    if (files.length > 0) {
      setUploadedVideo(files[0])
      // Update the current lesson with the video URL
      setCurrentLesson({
        ...currentLesson,
        video_url: files[0].url,
        file_name: files[0].file.name,
        file_size: files[0].file.size,
        file_type: files[0].file.type
      })
    }
  }

  const handleOpenNewLessonForm = () => {
    resetLessonFormState(lessons.length + 1)
    setShowForm(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson({ ...lesson })
    if (lesson.type === 'video' && lesson.video_url) {
      setUploadedVideo({
        url: lesson.video_url,
        file: {
          name: lesson.file_name || 'Uploaded video',
          size: lesson.file_size || 0,
          type: lesson.file_type || 'video/mp4'
        }
      })
    } else {
      setUploadedVideo(null)
    }

    setEditingLessonId(lesson.id)
    setShowForm(true)
  }

  const handleSaveLesson = async () => {
    if (!currentLesson.title.trim()) return

    setSavingLesson(true)
    setLessonSaveError(null)
    const existingLesson = lessons.find(l => l.id === editingLessonId)
    let updatedLessons: Lesson[]

    try {
      if (editingLessonId && !editingLessonId.startsWith('temp-')) {
        const { error } = await supabase
          .from('lessons')
          .update({
            title: currentLesson.title,
            type: currentLesson.type,
            duration_minutes: currentLesson.duration_minutes,
            video_url: currentLesson.video_url || null,
            text_content: currentLesson.text_content || null,
            quiz_id: currentLesson.quiz_id || null,
            file_url: currentLesson.file_url || null,
            file_name: currentLesson.file_name || null,
            file_size: currentLesson.file_size ?? null,
            file_type: currentLesson.file_type || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLessonId)

        if (error) {
          throw error
        }
      }

      if (editingLessonId && existingLesson) {
        const lessonToSave = {
          ...existingLesson,
          ...currentLesson,
          order_index: existingLesson.order_index ?? currentLesson.order_index
        }
        updatedLessons = lessons.map(l => l.id === editingLessonId ? lessonToSave : l)
      } else {
        const newLesson: Lesson = {
          ...currentLesson,
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order_index: lessons.length + 1
        }
        updatedLessons = [...lessons, newLesson]
      }

      const sortedLessons = [...updatedLessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      setLessons(sortedLessons)
      onLessonsChange(sortedLessons)

      resetLessonFormState(sortedLessons.length + 1)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving lesson:', error)
      setLessonSaveError('Failed to save lesson edits. Please try again later.')
    } finally {
      setSavingLesson(false)
    }
  }

  const handleCloseLessonForm = () => {
    resetLessonFormState(lessons.length + 1)
    setShowForm(false)
  }

  useEffect(() => {
    if (showForm && formRef.current) {
      window.requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [showForm, editingLessonId])

  const handleRemoveLesson = (lessonId: string) => {
    const updatedLessons = lessons.filter(l => l.id !== lessonId)
    setLessons(updatedLessons)
    onLessonsChange(updatedLessons)
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />
      case 'quiz': return <HelpCircle className="h-4 w-4 text-purple-500" />
      default: return <FileText className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Module Lessons</h3>
          <p className="text-sm text-muted-foreground">
            Add individual lessons to your module. You can assign quizzes to any lesson for assessment.
          </p>
        </div>
        <Button type="button" onClick={handleOpenNewLessonForm} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Add Lesson Form */}
      {showForm && (
        <div ref={formRef}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</CardTitle>
              <CardDescription>
                {editingLessonId ? 'Update the lesson details for this module' : 'Create a lesson for your module'}
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                  placeholder="e.g., Introduction to Budgeting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-type">Lesson Type</Label>
                <Select
                  value={currentLesson.type}
                  onValueChange={(value: 'video' | 'text' | 'quiz') =>
                    setCurrentLesson({ ...currentLesson, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Lesson</SelectItem>
                    <SelectItem value="video">Video Lesson</SelectItem>
                    <SelectItem value="quiz">Quiz Lesson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  value={currentLesson.duration_minutes}
                  onChange={(e) => setCurrentLesson({ 
                    ...currentLesson, 
                    duration_minutes: parseInt(e.target.value) || 5 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-quiz">Assign Quiz (Optional)</Label>
                <Select
                  value={currentLesson.quiz_id || 'none'}
                  onValueChange={(value) => setCurrentLesson({ 
                    ...currentLesson, 
                    quiz_id: value === 'none' ? undefined : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quiz for this lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Quiz</SelectItem>
                    {quizzes.filter(q => q.is_published).map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.name} ({quiz.questions.length} questions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentLesson.type === 'video' && (
              <div className="space-y-2">
                <Label>Upload Video</Label>
                <FileUploader
                  onFilesUploaded={handleVideoUploaded}
                  maxFiles={1}
                  acceptedTypes={['video/*']}
                  maxSize={500} // 500MB for videos
                />
                {uploadedVideo && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Video uploaded: {uploadedVideo.file.name}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload MP4, WebM, or other video formats. Maximum file size: 500MB.
                </p>
              </div>
            )}

            {currentLesson.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="text-content">Content</Label>
                {QuillEditor ? (
                  <div className="rounded-md border border-input bg-background">
                    <QuillEditor
                      id="text-content"
                      theme="snow"
                      value={currentLesson.text_content || ''}
                      onChange={(value: string) => setCurrentLesson({ 
                        ...currentLesson, 
                        text_content: value 
                      })}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter the lesson content..."
                    />
                  </div>
                ) : (
                  <Textarea
                    id="text-content"
                    value={currentLesson.text_content || ''}
                    onChange={(e) => setCurrentLesson({ 
                      ...currentLesson, 
                      text_content: e.target.value 
                    })}
                    placeholder="Enter the lesson content..."
                    rows={4}
                  />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" onClick={handleSaveLesson} disabled={savingLesson || !currentLesson.title.trim()}>
                {savingLesson ? 'Saving...' : editingLessonId ? 'Save Lesson' : 'Add Lesson'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCloseLessonForm}
                disabled={savingLesson}
              >
                Cancel
              </Button>
            </div>
            {lessonSaveError && (
              <p className="text-xs text-red-600">{lessonSaveError}</p>
            )}
          </CardContent>
        </Card>
        </div>
      )}

      {/* Lessons List */}
      {lessons.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Added Lessons ({lessons.length})</h4>
          {lessons.map((lesson, index) => {
            const isExistingLesson = lesson.id.startsWith('temp-') === false
            return (
              <Card key={lesson.id} className={isExistingLesson ? 'border-green-200 bg-green-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{lesson.title}</h5>
                          {isExistingLesson && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                              Existing
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{lesson.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {lesson.duration_minutes} min
                          </span>
                          {lesson.quiz_id && (
                            <Badge variant="secondary" className="text-xs">
                              Quiz: {quizzes.find(q => q.id === lesson.quiz_id)?.name || 'Unknown Quiz'}
                            </Badge>
                          )}
                        </div>
                        {lesson.video_url && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Video: {lesson.video_url}
                          </p>
                        )}
                        {lesson.text_content && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {lesson.text_content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLesson(lesson)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLesson(lesson.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
