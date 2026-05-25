import React, { useEffect, useState } from 'react'
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

const usePreviewUrl = (file) => {
  const [previewUrl, setPreviewUrl] = useState('')

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

  return previewUrl
}

const DocumentUploadCard = () => {
  const [nicFile, setNicFile] = useState(null)
  const [passportFile, setPassportFile] = useState(null)
  const [drivingFile, setDrivingFile] = useState(null)
  const [policeFile, setPoliceFile] = useState(null)
  const [qualificationFile, setQualificationFile] = useState(null)

  const [nicStatus, setNicStatus] = useState({ type: '', text: '' })
  const [passportStatus, setPassportStatus] = useState({ type: '', text: '' })
  const [drivingStatus, setDrivingStatus] = useState({ type: '', text: '' })
  const [policeStatus, setPoliceStatus] = useState({ type: '', text: '' })
  const [qualificationStatus, setQualificationStatus] = useState({ type: '', text: '' })

  const [nicUploadedUrl, setNicUploadedUrl] = useState('')
  const [passportUploadedUrl, setPassportUploadedUrl] = useState('')
  const [drivingUploadedUrl, setDrivingUploadedUrl] = useState('')
  const [policeUploadedUrl, setPoliceUploadedUrl] = useState('')
  const [qualificationUploadedUrl, setQualificationUploadedUrl] = useState('')

  const [nicUploading, setNicUploading] = useState(false)
  const [passportUploading, setPassportUploading] = useState(false)
  const [drivingUploading, setDrivingUploading] = useState(false)
  const [policeUploading, setPoliceUploading] = useState(false)
  const [qualificationUploading, setQualificationUploading] = useState(false)

  const nicPreviewUrl = usePreviewUrl(nicFile)
  const passportPreviewUrl = usePreviewUrl(passportFile)
  const drivingPreviewUrl = usePreviewUrl(drivingFile)
  const policePreviewUrl = usePreviewUrl(policeFile)
  const qualificationPreviewUrl = usePreviewUrl(qualificationFile)

  const handleFileChange = (event, setFile, setStatus, setUploadedUrl) => {
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

  const handleUpload = async ({
    file,
    fileType,
    setStatus,
    setUploadedUrl,
    setUploading,
    setFile
  }) => {
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

  const renderUploadSection = ({
    title,
    file,
    previewUrl,
    status,
    uploadedUrl,
    uploading,
    onFileChange,
    onUpload
  }) => (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Upload className="inline h-4 w-4 mr-2" />
          Select File
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.docx"
          onChange={onFileChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {file && (
          <p className="mt-2 text-sm text-slate-600">Selected: {file.name}</p>
        )}
      </div>

      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onUpload}
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
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Verification Documents</h3>
          <p className="text-sm text-slate-600">Upload verification documents (max 5MB).</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {renderUploadSection({
          title: 'NIC',
          file: nicFile,
          previewUrl: nicPreviewUrl,
          status: nicStatus,
          uploadedUrl: nicUploadedUrl,
          uploading: nicUploading,
          onFileChange: (event) =>
            handleFileChange(event, setNicFile, setNicStatus, setNicUploadedUrl),
          onUpload: () =>
            handleUpload({
              file: nicFile,
              fileType: 'NIC',
              setStatus: setNicStatus,
              setUploadedUrl: setNicUploadedUrl,
              setUploading: setNicUploading,
              setFile: setNicFile
            })
        })}

        {renderUploadSection({
          title: 'Passport',
          file: passportFile,
          previewUrl: passportPreviewUrl,
          status: passportStatus,
          uploadedUrl: passportUploadedUrl,
          uploading: passportUploading,
          onFileChange: (event) =>
            handleFileChange(event, setPassportFile, setPassportStatus, setPassportUploadedUrl),
          onUpload: () =>
            handleUpload({
              file: passportFile,
              fileType: 'Passport',
              setStatus: setPassportStatus,
              setUploadedUrl: setPassportUploadedUrl,
              setUploading: setPassportUploading,
              setFile: setPassportFile
            })
        })}

        {renderUploadSection({
          title: 'Driving License',
          file: drivingFile,
          previewUrl: drivingPreviewUrl,
          status: drivingStatus,
          uploadedUrl: drivingUploadedUrl,
          uploading: drivingUploading,
          onFileChange: (event) =>
            handleFileChange(event, setDrivingFile, setDrivingStatus, setDrivingUploadedUrl),
          onUpload: () =>
            handleUpload({
              file: drivingFile,
              fileType: 'DrivingLicense',
              setStatus: setDrivingStatus,
              setUploadedUrl: setDrivingUploadedUrl,
              setUploading: setDrivingUploading,
              setFile: setDrivingFile
            })
        })}

        {renderUploadSection({
          title: 'Police Clearance Certificate',
          file: policeFile,
          previewUrl: policePreviewUrl,
          status: policeStatus,
          uploadedUrl: policeUploadedUrl,
          uploading: policeUploading,
          onFileChange: (event) =>
            handleFileChange(event, setPoliceFile, setPoliceStatus, setPoliceUploadedUrl),
          onUpload: () =>
            handleUpload({
              file: policeFile,
              fileType: 'PoliceClearance',
              setStatus: setPoliceStatus,
              setUploadedUrl: setPoliceUploadedUrl,
              setUploading: setPoliceUploading,
              setFile: setPoliceFile
            })
        })}

        {renderUploadSection({
          title: 'NVQ / Other Qualification',
          file: qualificationFile,
          previewUrl: qualificationPreviewUrl,
          status: qualificationStatus,
          uploadedUrl: qualificationUploadedUrl,
          uploading: qualificationUploading,
          onFileChange: (event) =>
            handleFileChange(
              event,
              setQualificationFile,
              setQualificationStatus,
              setQualificationUploadedUrl
            ),
          onUpload: () =>
            handleUpload({
              file: qualificationFile,
              fileType: 'Qualification',
              setStatus: setQualificationStatus,
              setUploadedUrl: setQualificationUploadedUrl,
              setUploading: setQualificationUploading,
              setFile: setQualificationFile
            })
        })}
      </div>
    </div>
  )
}

export default DocumentUploadCard
