import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Video, FileText, HelpCircle } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  duration_minutes: number
  video_url?: string
  text_content?: string
  order_index: number
}

interface LessonCreatorProps {
  onLessonsChange: (lessons: Lesson[]) => void
  initialLessons?: Lesson[]
}

export default function LessonCreator({ onLessonsChange, initialLessons = [] }: LessonCreatorProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [showForm, setShowForm] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    id: '',
    title: '',
    type: 'text',
    duration_minutes: 5,
    order_index: lessons.length + 1
  })

  const handleAddLesson = () => {
    if (!currentLesson.title.trim()) return

    const newLesson: Lesson = {
      ...currentLesson,
      id: Date.now().toString()
    }

    const updatedLessons = [...lessons, newLesson].sort((a, b) => a.order_index - b.order_index)
    setLessons(updatedLessons)
    onLessonsChange(updatedLessons)

    // Reset form
    setCurrentLesson({
      id: '',
      title: '',
      type: 'text',
      duration_minutes: 5,
      order_index: updatedLessons.length + 1
    })
    setShowForm(false)
  }

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
            Add individual lessons to your module
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Add Lesson Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Lesson</CardTitle>
            <CardDescription>
              Create a lesson for your module
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
            </div>

            {currentLesson.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={currentLesson.video_url || ''}
                  onChange={(e) => setCurrentLesson({ 
                    ...currentLesson, 
                    video_url: e.target.value 
                  })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}

            {currentLesson.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="text-content">Content</Label>
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
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleAddLesson} disabled={!currentLesson.title.trim()}>
                Add Lesson
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      {lessons.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Added Lessons ({lessons.length})</h4>
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getLessonIcon(lesson.type)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{lesson.title}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{lesson.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration_minutes} min
                        </span>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

