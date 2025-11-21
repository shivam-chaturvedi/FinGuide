import React, { useState, useEffect, useMemo } from 'react'
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
import ErrorBoundary from '@/components/ErrorBoundary'
const loadReactQuill = () => import('react-quill')

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
  quiz_id: string | null
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
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [existingLessons, setExistingLessons] = useState<any[]>([])
  const [QuillEditor, setQuillEditor] = useState<any>(null)

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

  const loadModuleLessons = async (moduleId: string) => {
    try {
      console.log('Loading lessons for module:', moduleId)
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error loading lessons:', error)
        throw error
      }
      
      console.log('Loaded lessons:', data)
      setExistingLessons(data || [])
      return data || []
    } catch (error) {
      console.error('Error loading module lessons:', error)
      toast({
        title: "Error",
        description: "Failed to load module lessons",
        variant: "destructive"
      })
      return []
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files)
  }

  const handleLessonsChange = (lessons: any[]) => {
    setManualLessons(lessons)
  }

  const handleEditModule = async (module: Module) => {
    setEditingModule(module)
    setActiveTab('upload')
    
    // Populate form with existing module data
    setModuleForm({
      title: module.title,
      description: module.description || '',
      content: module.content,
      category: module.category as 'basics' | 'management' | 'remittance' | 'advanced' || 'basics',
      difficulty_level: module.difficulty_level || 'beginner',
      level: (module.difficulty_level?.charAt(0).toUpperCase() + module.difficulty_level?.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
      estimated_duration: module.estimated_duration || 30,
      duration_weeks: 1, // Default value since this might not exist in old modules
      rating: 4.0, // Default value
      price: 'Free' as 'Free' | 'Premium', // Default value
      thumbnail: '',
      what_youll_learn: [],
      prerequisites: [],
      quiz_id: module.quiz_id || 'none',
      is_published: module.is_published
    })

    // Load existing lessons for this module
    const lessons = await loadModuleLessons(module.id)
    
    // Convert existing lessons to manual lessons format
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration_minutes: lesson.duration_minutes,
      video_url: lesson.video_url,
      text_content: lesson.text_content,
      quiz_id: (lesson as any).quiz_id,
      order_index: lesson.order_index
    }))
    
    console.log('Formatted lessons for editing:', formattedLessons)
    setManualLessons(formattedLessons)
  }

  const handleCancelEdit = () => {
    setEditingModule(null)
    setExistingLessons([])
    setManualLessons([])
    setUploadedFiles([])
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
  }

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  }), [])

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link',
  ], [])

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

      const moduleData = {
        ...moduleForm,
        quiz_id: moduleForm.quiz_id === 'none' ? null : moduleForm.quiz_id,
        file_url: fileData?.file_url || null,
        file_name: fileData?.file_name || null,
        file_size: fileData?.file_size || null,
        file_type: fileData?.file_type || null
      }

      let moduleId: string

      if (editingModule) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', editingModule.id)

        if (error) throw error
        moduleId = editingModule.id

        // Delete existing lessons
        await supabase
          .from('lessons')
          .delete()
          .eq('module_id', moduleId)
      } else {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert({
            ...moduleData,
            created_by: user.id
          })

        if (error) throw error

        // Get the new module ID
        const { data } = await supabase
          .from('modules')
          .select('id')
          .eq('title', moduleForm.title)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        moduleId = data?.id
      }

      // Create lessons for uploaded files and manual lessons
      if (moduleId && (uploadedFiles.length > 0 || manualLessons.length > 0)) {
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
          quiz_id: null, // Uploaded files don't have quizzes by default
          is_completed: false,
          is_locked: false,
          order_index: index + 1
        }))

        const allLessons = [...fileLessons, ...manualLessons.map((lesson, index) => {
          // Remove the id field since Supabase will generate it
          const { id, ...lessonWithoutId } = lesson
          return {
            ...lessonWithoutId,
            module_id: moduleId,
            order_index: fileLessons.length + index + 1,
            quiz_id: lesson.quiz_id || null,
            is_completed: false,
            is_locked: false
          }
        })]

        console.log('Inserting lessons:', allLessons)
        const { error: lessonsError } = await supabase.from('lessons').insert(allLessons)
        
        if (lessonsError) {
          console.error('Error inserting lessons:', lessonsError)
          throw new Error(`Failed to create lessons: ${lessonsError.message}`)
        }
      }

      toast({
        title: "Success",
        description: editingModule ? "Module updated successfully" : "Module created successfully"
      })

      // Reset form
      handleCancelEdit()

      // Reload modules
      loadModules()
    } catch (error) {
      console.error('Error saving module:', error)
      toast({
        title: "Error",
        description: editingModule ? "Failed to update module" : "Failed to create module",
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">Module Management</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Upload and manage educational modules</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 w-fit">
              Admin Panel
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="modules" className="text-xs sm:text-sm px-2 py-2">Modules</TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs sm:text-sm px-2 py-2">Quizzes</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm px-2 py-2">Upload</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <div className="space-y-3 sm:space-y-4">
                    {modules.slice(0, 5).map((module) => (
                      <div key={module.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800/50 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium dark:text-white truncate">{module.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{module.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant={module.is_published ? "default" : "secondary"} className="text-xs">
                              {module.is_published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{module.difficulty_level}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(module.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModule(module)}
                            className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                            title="Edit Module"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleModulePublish(module.id, module.is_published)}
                            className="h-8 w-8 p-0"
                            title={module.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteModule(module.id)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            title="Delete Module"
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
                  <div className="space-y-4 sm:space-y-6">
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold dark:text-white truncate">{module.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{module.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge variant={module.is_published ? "default" : "secondary"} className="text-xs">
                                {module.is_published ? "Published" : "Draft"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{module.difficulty_level}</Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {module.estimated_duration} min
                              </span>
                              {module.category && (
                                <Badge variant="outline" className="text-xs">{module.category}</Badge>
                              )}
                            </div>

                            {module.file_name && (
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{module.file_name}</span>
                                {module.file_size && (
                                  <span className="text-xs">({Math.round(module.file_size / 1024)} KB)</span>
                                )}
                                {module.file_url && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => window.open(module.file_url, '_blank')}
                                    className="p-0 h-auto text-xs"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              Created: {new Date(module.created_at).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 lg:ml-4 lg:flex-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditModule(module)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleModulePublish(module.id, module.is_published)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="hidden sm:inline ml-1">
                                {module.is_published ? 'Unpublish' : 'Publish'}
                              </span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
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
            <ErrorBoundary>
              <QuizManager />
            </ErrorBoundary>
          </TabsContent>

          {/* Upload Module Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>{editingModule ? 'Edit Module' : 'Upload New Module'}</span>
                </CardTitle>
                <CardDescription>
                  {editingModule ? 'Update the selected module and its lessons' : 'Create a new educational module for users'}
                </CardDescription>
                {editingModule && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-sm">
                      Editing: {editingModule.title}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="ml-2"
                    >
                      Cancel Edit
                    </Button>
                  </div>
                )}
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
                    {QuillEditor ? (
                      <div className="rounded-md border border-input bg-background">
                        <QuillEditor
                          id="content"
                          theme="snow"
                          value={moduleForm.content}
                          onChange={(value: string) => setModuleForm({ ...moduleForm, content: value })}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Detailed content of the module..."
                          className="quill-editor"
                        />
                      </div>
                    ) : (
                      <Textarea
                        id="content"
                        value={moduleForm.content}
                        onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                        placeholder="Detailed content of the module..."
                        rows={8}
                        required
                      />
                    )}
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
                    <p className="text-xs text-muted-foreground">
                      Create individual lessons and optionally assign quizzes to each lesson for assessment.
                      {editingModule && ' Existing lessons will be loaded for editing.'}
                    </p>
                    <LessonCreator
                      onLessonsChange={handleLessonsChange}
                      initialLessons={manualLessons}
                      quizzes={quizzes}
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
                        {editingModule ? 'Updating Module...' : 'Creating Module...'}
                      </div>
                    ) : (
                      editingModule ? 'Update Module' : 'Create Module'
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
