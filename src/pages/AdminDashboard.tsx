import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Upload, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  HelpCircle
} from 'lucide-react'
import QuizManager from '@/components/QuizManager'
import FileUploader from '@/components/FileUploader'
import LessonCreator from '@/components/LessonCreator'

interface Module {
  id: string
  title: string
  description: string | null
  content: string
  category: string | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  estimated_duration: number | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'basics' as 'basics' | 'management' | 'remittance' | 'advanced',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimated_duration: 30,
    duration_weeks: 1,
    rating: 4.0,
    price: 'Free' as 'Free' | 'Premium',
    thumbnail: '',
    what_youll_learn: [] as string[],
    prerequisites: [] as string[],
    quiz_id: 'none',
    is_published: false
  })
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [manualLessons, setManualLessons] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/'
      return
    }
  }, [isAdmin])

  // Load modules and quizzes
  useEffect(() => {
    if (isAdmin) {
      loadModules()
      loadQuizzes()
    }
  }, [isAdmin])

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error loading modules:', error)
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files)
  }

  const handleLessonsChange = (lessons: any[]) => {
    setManualLessons(lessons)
  }

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUploading(true)
    try {
      // Prepare file data from uploaded files
      const fileData = uploadedFiles.length > 0 ? {
        file_url: uploadedFiles[0].url,
        file_name: uploadedFiles[0].file.name,
        file_size: uploadedFiles[0].file.size,
        file_type: uploadedFiles[0].file.type
      } : null

      const { error } = await supabase
        .from('modules')
        .insert({
          ...moduleForm,
          quiz_id: moduleForm.quiz_id === 'none' ? null : moduleForm.quiz_id,
          created_by: user.id,
          file_url: fileData?.file_url || null,
          file_name: fileData?.file_name || null,
          file_size: fileData?.file_size || null,
          file_type: fileData?.file_type || null
        })

      if (error) throw error

      // Create lessons for uploaded files and manual lessons
      if (uploadedFiles.length > 0 || manualLessons.length > 0) {
        const moduleId = (await supabase
          .from('modules')
          .select('id')
          .eq('title', moduleForm.title)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()).data?.id

        if (moduleId) {
          const fileLessons = uploadedFiles.map((fileObj, index) => ({
            module_id: moduleId,
            title: fileObj.file.name,
            type: fileObj.file.type.startsWith('video/') ? 'video' : 
                  fileObj.file.type.startsWith('image/') ? 'text' : 'text',
            duration_minutes: 5, // Default duration
            video_url: fileObj.file.type.startsWith('video/') ? fileObj.url : null,
            text_content: fileObj.file.type.startsWith('image/') ? 
              `Image: ${fileObj.file.name}` : 
              fileObj.file.type === 'application/pdf' ? 
                `PDF Document: ${fileObj.file.name}` : 
                `Document: ${fileObj.file.name}`,
            file_url: fileObj.url,
            file_name: fileObj.file.name,
            file_size: fileObj.file.size,
            file_type: fileObj.file.type,
            order_index: index + 1
          }))

          const allLessons = [...fileLessons, ...manualLessons.map((lesson, index) => ({
            ...lesson,
            module_id: moduleId,
            order_index: fileLessons.length + index + 1
          }))]

          await supabase.from('lessons').insert(allLessons)
        }
      }

      toast({
        title: "Success",
        description: "Module created successfully"
      })

      // Reset form
      setModuleForm({
        title: '',
        description: '',
        content: '',
        category: 'basics',
        difficulty_level: 'beginner',
        level: 'Beginner',
        estimated_duration: 30,
        duration_weeks: 1,
        rating: 4.0,
        price: 'Free',
        thumbnail: '',
        what_youll_learn: [],
        prerequisites: [],
        quiz_id: 'none',
        is_published: false
      })
      setUploadedFiles([])
      setManualLessons([])

      // Reload modules
      loadModules()
    } catch (error) {
      console.error('Error creating module:', error)
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const toggleModulePublish = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_published: !currentStatus })
        .eq('id', moduleId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Module ${!currentStatus ? 'published' : 'unpublished'}`
      })

      loadModules()
    } catch (error) {
      console.error('Error updating module:', error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive"
      })
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Module deleted successfully"
      })

      loadModules()
    } catch (error) {
      console.error('Error deleting module:', error)
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive"
      })
    }
  }


  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Module Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Upload and manage educational modules</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              Admin Panel
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">My Modules</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="upload">Upload Module</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {modules.filter(m => m.is_published).length} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {modules.filter(m => m.is_published).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available to users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {modules.filter(m => !m.is_published).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Not yet published
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Modules</CardTitle>
                <CardDescription>Latest modules added to the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 dark:text-gray-300">Loading...</div>
                ) : modules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No modules found. Upload your first module!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.slice(0, 5).map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex-1">
                          <h3 className="font-medium dark:text-white">{module.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={module.is_published ? "default" : "secondary"}>
                              {module.is_published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline">{module.difficulty_level}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(module.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleModulePublish(module.id, module.is_published)}
                          >
                            {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteModule(module.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Modules</CardTitle>
                <CardDescription>Manage your uploaded modules</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 dark:text-gray-300">Loading modules...</div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold dark:text-white">{module.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{module.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant={module.is_published ? "default" : "secondary"}>
                                {module.is_published ? "Published" : "Draft"}
                              </Badge>
                              <Badge variant="outline">{module.difficulty_level}</Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {module.estimated_duration} min
                              </span>
                              {module.category && (
                                <Badge variant="outline">{module.category}</Badge>
                              )}
                            </div>

                            {module.file_name && (
                              <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <FileText className="h-4 w-4" />
                                <span>{module.file_name}</span>
                                {module.file_size && (
                                  <span>({Math.round(module.file_size / 1024)} KB)</span>
                                )}
                                {module.file_url && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => window.open(module.file_url, '_blank')}
                                    className="p-0 h-auto"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              Created: {new Date(module.created_at).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleModulePublish(module.id, module.is_published)}
                            >
                              {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {module.is_published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <QuizManager />
          </TabsContent>

          {/* Upload Module Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload New Module</span>
                </CardTitle>
                <CardDescription>
                  Create a new educational module for users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitModule} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Module Title *</Label>
                      <Input
                        id="title"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        placeholder="e.g., Basic Financial Planning"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={moduleForm.category}
                        onValueChange={(value: 'basics' | 'management' | 'remittance' | 'advanced') =>
                          setModuleForm({ ...moduleForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basics">Basics</SelectItem>
                          <SelectItem value="management">Savings & Management</SelectItem>
                          <SelectItem value="remittance">Remittances</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={moduleForm.difficulty_level}
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                          setModuleForm({ ...moduleForm, difficulty_level: value, level: value.charAt(0).toUpperCase() + value.slice(1) as 'Beginner' | 'Intermediate' | 'Advanced' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Select
                        value={moduleForm.price}
                        onValueChange={(value: 'Free' | 'Premium') =>
                          setModuleForm({ ...moduleForm, price: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={moduleForm.estimated_duration}
                        onChange={(e) => setModuleForm({ ...moduleForm, estimated_duration: parseInt(e.target.value) || 30 })}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weeks">Duration (weeks)</Label>
                      <Input
                        id="weeks"
                        type="number"
                        value={moduleForm.duration_weeks}
                        onChange={(e) => setModuleForm({ ...moduleForm, duration_weeks: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={moduleForm.rating}
                        onChange={(e) => setModuleForm({ ...moduleForm, rating: parseFloat(e.target.value) || 4.0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail Text</Label>
                      <Input
                        id="thumbnail"
                        value={moduleForm.thumbnail}
                        onChange={(e) => setModuleForm({ ...moduleForm, thumbnail: e.target.value })}
                        placeholder="e.g., Financial Basics"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz">Select Quiz (Optional)</Label>
                      <Select
                        value={moduleForm.quiz_id}
                        onValueChange={(value) => setModuleForm({ ...moduleForm, quiz_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a quiz for this module" />
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

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      placeholder="Brief description of the module content..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Module Content *</Label>
                    <Textarea
                      id="content"
                      value={moduleForm.content}
                      onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                      placeholder="Detailed content of the module..."
                      rows={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="what_youll_learn">What You'll Learn (one per line)</Label>
                    <Textarea
                      id="what_youll_learn"
                      value={moduleForm.what_youll_learn.join('\n')}
                      onChange={(e) => setModuleForm({ 
                        ...moduleForm, 
                        what_youll_learn: e.target.value.split('\n').filter(item => item.trim() !== '')
                      })}
                      placeholder="Understand Singapore's financial system&#10;Create and maintain a personal budget&#10;Learn about banking and savings accounts"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
                    <Textarea
                      id="prerequisites"
                      value={moduleForm.prerequisites.join('\n')}
                      onChange={(e) => setModuleForm({ 
                        ...moduleForm, 
                        prerequisites: e.target.value.split('\n').filter(item => item.trim() !== '')
                      })}
                      placeholder="Basic English&#10;Singapore work permit"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Files (Optional)</Label>
                    <FileUploader
                      onFilesUploaded={handleFilesUploaded}
                      maxFiles={10}
                      acceptedTypes={[
                        'image/*',
                        'video/*',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      ]}
                      maxSize={100} // 100MB
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload videos, images, PDFs, documents, and other educational materials. 
                      Each file will become a lesson in your module.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Or Create Lessons Manually</Label>
                    <LessonCreator
                      onLessonsChange={handleLessonsChange}
                      initialLessons={manualLessons}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={moduleForm.is_published}
                      onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_published: checked })}
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>

                  <Button type="submit" disabled={uploading} className="w-full">
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        Creating Module...
                      </div>
                    ) : (
                      'Create Module'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
