import React, { useEffect, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadService } from '../../services/api'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx']

const isAllowedFile = (file) => {
  if (!file) return false
  if (allowedMimeTypes.includes(file.type)) return true
  const name = file.name?.toLowerCase() || ''
  return allowedExtensions.some((ext) => name.endsWith(ext))
}

const DocumentUploadCard = () => {
  const [fileType, setFileType] = useState('NIC')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileTypes = useMemo(
    () => [
      { label: 'NIC', value: 'NIC' },
      { label: 'Certificate', value: 'Certificate' },
      { label: 'Profile Picture', value: 'ProfilePicture' },
      { label: 'Other', value: 'Other' }
    ],
    []
  )

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl('')
      return
    }

    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [file])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    setStatus({ type: '', text: '' })
    setUploadedUrl('')

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!isAllowedFile(selectedFile)) {
      setFile(null)
      setStatus({
        type: 'error',
        text: 'Only JPG, PNG, PDF, or DOCX files are allowed.'
      })
      return
    }

    if (selectedFile.size > MAX_FILE_BYTES) {
      setFile(null)
      setStatus({ type: 'error', text: 'File size must be 5MB or less.' })
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', text: 'Please select a file to upload.' })
      return
    }

    try {
      setUploading(true)
      setStatus({ type: '', text: '' })
      const response = await uploadService.uploadDocument({ file, fileType })
      const fileUrl = response.data?.data?.fileUrl || ''
      setUploadedUrl(fileUrl)
      setStatus({ type: 'success', text: response.data?.message || 'Upload complete.' })
      setFile(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed. Please try again.'
      setStatus({ type: 'error', text: message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Quick Document Upload</h3>
          <p className="text-sm text-slate-600">Upload images or documents (max 5MB).</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
          <select
            value={fileType}
            onChange={(event) => setFileType(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {fileTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Upload className="inline h-4 w-4 mr-2" />
            Select File
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {file && (
            <p className="mt-2 text-sm text-slate-600">Selected: {file.name}</p>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        {uploadedUrl && (
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-700 underline"
          >
            View uploaded file
          </a>
        )}
      </div>

      {status.text && (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            status.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  )
}

export default DocumentUploadCard
