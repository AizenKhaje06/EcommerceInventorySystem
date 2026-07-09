'use client'

import React, { useRef, useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useToast } from '@/components/toast-provider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface FileUploadProps {
  bucket: 'chat-files' | 'product-images' | 'profile-images' | 'order-attachments'
  onUploadComplete: (url: string, file: File) => void
  accept?: string
  maxSize?: number // in bytes
  buttonText?: string
  className?: string
}

export function FileUpload({
  bucket,
  onUploadComplete,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  buttonText = 'Upload File',
  className = ''
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      showToast(`File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`, 'error')
      return
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Upload file
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadComplete(urlData.publicUrl, file)
      showToast('File uploaded successfully', 'success', 2000)
      setPreview(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      showToast(error.message || 'Failed to upload file', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {buttonText}
          </>
        )}
      </button>

      {preview && (
        <div className="mt-2 relative">
          <img src={preview} alt="Preview" className="max-w-xs rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// Helper component for displaying uploaded files
interface FilePreviewProps {
  url: string
  fileName: string
  fileType: string
  onRemove?: () => void
}

export function FilePreview({ url, fileName, fileType, onRemove }: FilePreviewProps) {
  const isImage = fileType.startsWith('image/')

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      {isImage ? (
        <img src={url} alt={fileName} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded">
          <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{fileName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{fileType}</p>
      </div>
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
      )}
    </div>
  )
}
