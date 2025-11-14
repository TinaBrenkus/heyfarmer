'use client'

import { useState } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface ProfilePhotoUploadProps {
  userId: string
  currentPhotoUrl?: string | null
  onUploadComplete?: (url: string) => void
}

export default function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  onUploadComplete
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    await uploadPhoto(file)
  }

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Delete ALL old photos in the user's folder first
      const { data: existingFiles } = await supabase.storage
        .from('profile-photos')
        .list(userId)

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`)
        await supabase.storage
          .from('profile-photos')
          .remove(filesToRemove)
      }

      // Create unique filename with timestamp to avoid caching issues
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${userId}/profile-${timestamp}.${fileExt}`

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setPhotoUrl(publicUrl)
      setPreview(null) // Clear preview after successful upload

      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload photo')
      setPreview(null) // Clear preview on error too
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async () => {
    if (!photoUrl) return

    setUploading(true)
    setError(null)

    try {
      // Delete from storage
      const path = photoUrl.split('/profile-photos/')[1]
      if (path) {
        await supabase.storage
          .from('profile-photos')
          .remove([path])
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) throw updateError

      setPhotoUrl(null)
      setPreview(null)
      if (onUploadComplete) {
        onUploadComplete('')
      }

    } catch (err: any) {
      console.error('Remove error:', err)
      setError(err.message || 'Failed to remove photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo Preview */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {preview || photoUrl ? (
              <Image
                src={preview || photoUrl || ''}
                alt="Profile photo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a photo to personalize your profile. Max 5MB.
          </p>

          <div className="flex gap-3">
            {/* Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: uploading ? '#94a3b8' : '#2E7D32' }}
              >
                <Upload className="w-4 h-4" />
                {photoUrl ? 'Change Photo' : 'Upload Photo'}
              </div>
            </label>

            {/* Remove Button */}
            {photoUrl && (
              <button
                onClick={removePhoto}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
