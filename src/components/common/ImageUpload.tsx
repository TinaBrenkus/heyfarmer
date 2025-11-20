'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (url: string) => void
  bucket: 'listing-images' | 'profile-images'
  maxSizeMB?: number
  aspectRatio?: string
}

export default function ImageUpload({
  currentImage,
  onImageUploaded,
  bucket,
  maxSizeMB = 5,
  aspectRatio = '16/9'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | undefined>(currentImage)

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null)
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]

      // Check file size
      const fileSizeMB = file.size / 1024 / 1024
      if (fileSizeMB > maxSizeMB) {
        setError(`File size must be less than ${maxSizeMB}MB`)
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image')
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to upload images')
        return
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onImageUploaded(publicUrl)
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreview(undefined)
    onImageUploaded('')
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <div
            className="rounded-lg overflow-hidden border-2 border-gray-200"
            style={{ aspectRatio }}
          >
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="block">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
            style={{ aspectRatio }}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to {maxSizeMB}MB</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
