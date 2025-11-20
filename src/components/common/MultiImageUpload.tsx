'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MultiImageUploadProps {
  currentImages?: string[]
  onImagesUpdated: (urls: string[]) => void
  bucket: 'listing-images' | 'profile-images'
  maxImages?: number
  maxSizeMB?: number
}

export default function MultiImageUpload({
  currentImages = [],
  onImagesUpdated,
  bucket,
  maxImages = 5,
  maxSizeMB = 5
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(currentImages)

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null)
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]

      // Check if we've reached max images
      if (images.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed`)
        return
      }

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

      const updatedImages = [...images, publicUrl]
      setImages(updatedImages)
      onImagesUpdated(updatedImages)

      // Reset input
      event.target.value = ''
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesUpdated(updatedImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)
    setImages(updatedImages)
    onImagesUpdated(updatedImages)
  }

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  Main
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>

              {/* Move Left Button */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  className="absolute left-1 bottom-1 p-1 bg-white/90 rounded shadow opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity"
                  title="Move left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Move Right Button */}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  className="absolute right-1 bottom-1 p-1 bg-white/90 rounded shadow opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity"
                  title="Move right"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {images.length === 0 ? 'Click to upload images' : 'Add another image'}
                </p>
                <p className="text-xs text-gray-500">
                  {images.length} of {maxImages} images • PNG, JPG up to {maxSizeMB}MB each
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 Tip: The first image will be used as the main photo. Drag images to reorder.
        </p>
      )}
    </div>
  )
}
