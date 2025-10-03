import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  File, 
  FileText, 
  Video, 
  Image, 
  FileType, 
  X, 
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('video/')) return <Video className="h-4 w-4 text-red-500" />
  if (fileType.startsWith('image/')) return <Image className="h-4 w-4 text-green-500" />
  if (fileType === 'application/pdf') return <FileType className="h-4 w-4 text-red-500" />
  if (fileType.includes('document') || fileType.includes('text')) return <FileText className="h-4 w-4 text-blue-500" />
  return <File className="h-4 w-4 text-gray-500" />
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function FileUploader({ 
  onFilesUploaded, 
  maxFiles = 10, 
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  maxSize = 50 // 50MB default
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `modules/${fileName}`

    const { error } = await supabase.storage
      .from('modules')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('modules')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Check file count limit
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsUploading(true)

    // Create initial file objects
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      file,
      progress: 0,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload files one by one
    for (let i = 0; i < newFiles.length; i++) {
      const fileObj = newFiles[i]
      
      try {
        // Update progress
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, progress: 25 }
              : f
          )
        )

        const url = await uploadFile(fileObj.file)

        // Update progress and status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, progress: 100, status: 'completed', url }
              : f
          )
        )

      } catch (error) {
        console.error('Upload error:', error)
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { 
                  ...f, 
                  progress: 0, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        )
      }
    }

    setIsUploading(false)
  }, [uploadedFiles.length, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      onFilesUploaded(updated)
      return updated
    })
  }

  const clearAllFiles = () => {
    setUploadedFiles([])
    onFilesUploaded([])
  }

  // Update parent component when files change
  React.useEffect(() => {
    onFilesUploaded(uploadedFiles)
  }, [uploadedFiles, onFilesUploaded])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-600 mb-4">
              or click to select files
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: Images, Videos, PDFs, Documents</p>
              <p>Max size: {maxSize}MB per file • Max files: {maxFiles}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFiles}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((fileObj) => (
                <div key={fileObj.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(fileObj.file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            fileObj.status === 'completed' ? 'default' :
                            fileObj.status === 'error' ? 'destructive' : 'secondary'
                          }
                        >
                          {fileObj.status === 'completed' ? 'Completed' :
                           fileObj.status === 'error' ? 'Error' : 'Uploading'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileObj.id)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {formatFileSize(fileObj.file.size)}
                    </div>

                    {fileObj.status === 'uploading' && (
                      <Progress value={fileObj.progress} className="h-2" />
                    )}

                    {fileObj.status === 'completed' && fileObj.url && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => window.open(fileObj.url, '_blank')}
                          className="p-0 h-auto text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View File
                        </Button>
                      </div>
                    )}

                    {fileObj.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">{fileObj.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Status */}
      {isUploading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Uploading files... Please wait while your files are being processed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
