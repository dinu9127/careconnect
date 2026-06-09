import React, { useEffect, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
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

const DocumentUploadCard = ({ certifications = [] }) => {
  const [activeSection, setActiveSection] = useState(0)
  const [identityType, setIdentityType] = useState('')
  const [identityFile, setIdentityFile] = useState(null)
  const [policeFile, setPoliceFile] = useState(null)
  const [qualificationFile, setQualificationFile] = useState(null)
  const [qualificationItems, setQualificationItems] = useState([])
  const [identityExtraFiles, setIdentityExtraFiles] = useState([])
  const [identityExtraError, setIdentityExtraError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)

  const [identityMeta, setIdentityMeta] = useState({ idNumber: '', issueDate: '', expiryDate: '' })
  const [policeMeta, setPoliceMeta] = useState({ certificateNumber: '', issueDate: '', expiryDate: '' })

  const [identityStatus, setIdentityStatus] = useState({ type: '', text: '' })
  const [policeStatus, setPoliceStatus] = useState({ type: '', text: '' })
  const [qualificationStatus, setQualificationStatus] = useState({ type: '', text: '' })

  const [identityUploadedUrl, setIdentityUploadedUrl] = useState('')
  const [policeUploadedUrl, setPoliceUploadedUrl] = useState('')
  const [qualificationUploadedUrl, setQualificationUploadedUrl] = useState('')

  const [identityUploading, setIdentityUploading] = useState(false)
  const [policeUploading, setPoliceUploading] = useState(false)
  const [qualificationUploading, setQualificationUploading] = useState(false)

  const identityPreviewUrl = usePreviewUrl(identityFile)
  const policePreviewUrl = usePreviewUrl(policeFile)
  const qualificationPreviewUrl = usePreviewUrl(qualificationFile)
  const identityExtraInputRef = useRef(null)

  const allowedExtraMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
  const allowedExtraExtensions = ['.pdf', '.jpg', '.jpeg', '.png']

  const isAllowedExtraFile = (file) => {
    if (!file) return false
    if (allowedExtraMimeTypes.includes(file.type)) return true
    const name = file.name?.toLowerCase() || ''
    return allowedExtraExtensions.some((ext) => name.endsWith(ext))
  }

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const addIdentityExtraFiles = (files) => {
    if (!files || files.length === 0) return
    setIdentityExtraError('')

    const nextItems = Array.from(files).map((file, index) => {
      const id = `${Date.now()}-${index}-${file.name}`
      if (!isAllowedExtraFile(file)) {
        return { id, file, status: 'error', progress: 0, error: 'Only PDF, JPG, or PNG files are allowed.' }
      }
      if (file.size > MAX_FILE_BYTES) {
        return { id, file, status: 'error', progress: 0, error: 'File size must be 5MB or less.' }
      }
      return { id, file, status: 'pending', progress: 0, error: '' }
    })

    setIdentityExtraFiles((prev) => [...prev, ...nextItems])
  }

  const handleIdentityExtraBrowse = (event) => {
    addIdentityExtraFiles(event.target.files)
    if (event.target.value) event.target.value = ''
  }

  const handleIdentityExtraDrop = (event) => {
    event.preventDefault()
    setIsDragActive(false)
    addIdentityExtraFiles(event.dataTransfer.files)
  }

  const handleIdentityExtraRemove = (id) => {
    setIdentityExtraFiles((prev) => prev.filter((item) => item.id !== id))
  }

  const uploadIdentityExtras = async () => {
    const pendingFiles = identityExtraFiles.filter((item) => item.status === 'pending')
    if (pendingFiles.length === 0) {
      setIdentityExtraError('Please add at least one valid file to upload.')
      return
    }

    setIdentityExtraError('')

    await Promise.all(
      pendingFiles.map((item) => {
        return uploadService.uploadDocument({
          file: item.file,
          fileType: 'IdentityAdditional',
          metadata: { identityType, identityNumber: identityMeta.idNumber },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 0
            if (!total) return
            const percent = Math.round((progressEvent.loaded / total) * 100)
            setIdentityExtraFiles((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, progress: percent, status: 'uploading' } : entry
              )
            )
          }
        })
          .then(() => {
            setIdentityExtraFiles((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, status: 'uploaded', progress: 100 } : entry
              )
            )
          })
          .catch((error) => {
            const message = error.response?.data?.message || 'Upload failed. Please try again.'
            setIdentityExtraFiles((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, status: 'error', error: message } : entry
              )
            )
          })
      })
    )
  }

  const identityNumberLabel =
    identityType === 'NIC' ? 'NIC Number'
    : identityType === 'Passport' ? 'Passport Number'
    : identityType === 'DrivingLicense' ? 'Driving License Number'
    : 'Document Number'

  const identityNumberPlaceholder =
    identityType === 'NIC' ? 'e.g., 200012345678'
    : identityType === 'Passport' ? 'e.g., N1234567'
    : identityType === 'DrivingLicense' ? 'e.g., 123456789'
    : 'Enter document number'

  const handleFileChange = (event, setFile, setStatus, setUploadedUrl) => {
    const selectedFile = event.target.files?.[0] || null
    setStatus({ type: '', text: '' })
    setUploadedUrl('')

    if (!selectedFile) { setFile(null); return }

    if (!isAllowedFile(selectedFile)) {
      setFile(null)
      setStatus({ type: 'error', text: 'Only JPG, PNG, PDF, or DOCX files are allowed.' })
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
    file, fileType, metadata,
    setStatus, setUploadedUrl, setUploading, setFile, onSuccess
  }) => {
    if (!file) { setStatus({ type: 'error', text: 'Please select a file to upload.' }); return }

    const today = new Date()

    const validateIssueDate = (issueDate, label) => {
      if (!issueDate) return `${label} is required.`
      const parsed = new Date(issueDate)
      if (Number.isNaN(parsed.getTime())) return `${label} is invalid.`
      if (parsed > today) return `${label} cannot be in the future.`
      return ''
    }

    const validateExpiryDate = (issueDate, expiryDate, label) => {
      if (!expiryDate) return ''
      const issue = new Date(issueDate)
      const expiry = new Date(expiryDate)
      if (Number.isNaN(expiry.getTime())) return `${label} is invalid.`
      if (!Number.isNaN(issue.getTime()) && expiry < issue) return `${label} cannot be before issue date.`
      return ''
    }

    const requireExpiryDate = (expiryDate, label) => {
      if (!expiryDate) return `${label} is required.`
      return ''
    }

    const validateIdNumber = (type, idNumber) => {
      const trimmed = idNumber.trim()
      if (!trimmed) return 'ID number is required.'
      if (type === 'NIC' && !/^\d{9}[vVxX]?$|^\d{12}$/.test(trimmed))
        return 'NIC must be 9 digits (optionally with V/X) or 12 digits.'
      if (type === 'Passport' && !/^[A-Za-z0-9]{6,12}$/.test(trimmed))
        return 'Passport number must be 6-12 letters/numbers.'
      if (type === 'DrivingLicense' && !/^\d{8,10}$/.test(trimmed))
        return 'Driving license number must be 8-10 digits.'
      return ''
    }

    const validatePoliceNumber = (certificateNumber) => {
      const trimmed = certificateNumber.trim()
      if (!trimmed) return 'Certificate number is required.'
      if (!/^[A-Za-z0-9\/-]{6,20}$/.test(trimmed)) return 'Certificate number must be 6-20 characters.'
      return ''
    }

    if (!fileType) { setStatus({ type: 'error', text: 'Please select a document type.' }); return }

    let validationError = ''
    if (['NIC', 'Passport', 'DrivingLicense'].includes(fileType)) {
      validationError =
        validateIdNumber(fileType, metadata?.idNumber || '') ||
        validateIssueDate(metadata?.issueDate, 'Issue date') ||
        (fileType !== 'NIC' ? requireExpiryDate(metadata?.expiryDate, 'Expiry date') : '') ||
        validateExpiryDate(metadata?.issueDate, metadata?.expiryDate, 'Expiry date')
    } else if (fileType === 'PoliceClearance') {
      validationError =
        validatePoliceNumber(metadata?.certificateNumber || '') ||
        validateIssueDate(metadata?.issueDate, 'Issue date') ||
        validateExpiryDate(metadata?.issueDate, metadata?.expiryDate, 'Expiry date')
    }

    if (validationError) { setStatus({ type: 'error', text: validationError }); return }

    try {
      setUploading(true)
      setStatus({ type: '', text: '' })
      const response = await uploadService.uploadDocument({ file, fileType, metadata })
      const fileUrl = response.data?.data?.fileUrl || ''
      setUploadedUrl(fileUrl)
      setStatus({ type: 'success', text: response.data?.message || 'Upload complete.' })
      setFile(null)
      if (onSuccess) onSuccess()
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed. Please try again.'
      setStatus({ type: 'error', text: message })
    } finally {
      setUploading(false)
    }
  }

  const renderUploadSection = ({
    title, file, previewUrl, status, uploadedUrl, uploading,
    onFileChange, onUpload, extraFields, dragDrop, afterSelectContent
  }) => (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>

      {extraFields && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">{extraFields}</div>
      )}

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Upload className="inline h-4 w-4 mr-2" />
          Select File
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.docx"
          onChange={onFileChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
      </div>

      {dragDrop && (
        <div
          className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${
            dragDrop.isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(event) => { event.preventDefault(); dragDrop.setIsDragActive(true) }}
          onDragLeave={() => dragDrop.setIsDragActive(false)}
          onDrop={dragDrop.onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              dragDrop.inputRef.current?.click()
            }
          }}
          onClick={() => dragDrop.inputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-blue-600" />
          <p className="text-sm text-gray-700">Drag & drop files here or click to browse</p>
          <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG. Max 5MB per file.</p>
          <input
            ref={dragDrop.inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={dragDrop.onBrowse}
          />
        </div>
      )}

      {afterSelectContent}

      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        {uploadedUrl && (
          <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline">
            View uploaded file
          </a>
        )}
      </div>

      {status.text && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${
          status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {status.text}
        </div>
      )}
    </div>
  )

  const advanceSection = () => setActiveSection((prev) => Math.min(prev + 1, 2))

  const normalizedCertifications = Array.isArray(certifications)
    ? certifications.map((item) => item.trim()).filter(Boolean)
    : []

  useEffect(() => {
    if (normalizedCertifications.length === 0) {
      setQualificationItems([])
      return
    }

    setQualificationItems((prev) => {
      const next = normalizedCertifications.map((name, index) => {
        const existing = prev.find((item) => item.name === name)
        if (existing) return existing
        return {
          id: `${name}-${index}`,
          name,
          files: [],
          status: { type: '', text: '' },
          uploadedUrls: [],
          uploading: false
        }
      })
      return next
    })
  }, [normalizedCertifications])

  const updateQualificationItem = (name, updates) => {
    setQualificationItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, ...updates } : item))
    )
  }

  const handleQualificationFileSelect = (event, name) => {
    const selectedFiles = Array.from(event.target.files || [])
    updateQualificationItem(name, { status: { type: '', text: '' } })

    const validFiles = []
    for (const file of selectedFiles) {
      if (!isAllowedFile(file)) {
        updateQualificationItem(name, {
          status: { type: 'error', text: 'Only JPG, PNG, PDF, or DOCX files are allowed.' }
        })
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        updateQualificationItem(name, {
          status: { type: 'error', text: 'File size must be 5MB or less per file.' }
        })
        return
      }
      validFiles.push(file)
    }

    setQualificationItems((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, files: [...(item.files || []), ...validFiles] }
          : item
      )
    )
  }

  const handleQualificationFileRemove = (name, index) => {
    setQualificationItems((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, files: item.files.filter((_, i) => i !== index) }
          : item
      )
    )
  }

  const handleQualificationUpload = async (item) => {
    if (!item.files || item.files.length === 0) {
      updateQualificationItem(item.name, {
        status: { type: 'error', text: 'Please select at least one file to upload.' }
      })
      return
    }

    try {
      updateQualificationItem(item.name, { uploading: true, status: { type: '', text: '' } })
      const uploadedUrls = []

      for (const file of item.files) {
        const response = await uploadService.uploadDocument({
          file,
          fileType: 'Qualification',
          metadata: { certificationName: item.name }
        })
        const fileUrl = response.data?.data?.fileUrl || ''
        if (fileUrl) uploadedUrls.push(fileUrl)
      }

      updateQualificationItem(item.name, {
        uploading: false,
        files: [],
        uploadedUrls: [...(item.uploadedUrls || []), ...uploadedUrls],
        status: {
          type: 'success',
          text: `${uploadedUrls.length} file${uploadedUrls.length !== 1 ? 's' : ''} uploaded successfully.`
        }
      })
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed. Please try again.'
      updateQualificationItem(item.name, {
        uploading: false,
        status: { type: 'error', text: message }
      })
    }
  }

  return (
    <div className="grid gap-4">
      {/* Identity Document */}
      {renderUploadSection({
        title: 'Identity Document (NIC / Passport / Driving License)',
        file: identityFile,
        previewUrl: identityPreviewUrl,
        status: identityStatus,
        uploadedUrl: identityUploadedUrl,
        uploading: identityUploading,
        extraFields: (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
              <select
                value={identityType}
                onChange={(event) => setIdentityType(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select document type</option>
                <option value="NIC">NIC</option>
                <option value="Passport">Passport</option>
                <option value="DrivingLicense">Driving License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{identityNumberLabel}</label>
              <input
                type="text"
                value={identityMeta.idNumber}
                onChange={(event) => setIdentityMeta((prev) => ({ ...prev, idNumber: event.target.value }))}
                placeholder={identityNumberPlaceholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Issue Date</label>
              <input
                type="date"
                value={identityMeta.issueDate}
                onChange={(event) => setIdentityMeta((prev) => ({ ...prev, issueDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={identityMeta.expiryDate}
                onChange={(event) => setIdentityMeta((prev) => ({ ...prev, expiryDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </>
        ),
        onFileChange: (event) =>
          handleFileChange(event, setIdentityFile, setIdentityStatus, setIdentityUploadedUrl),
        onUpload: () =>
          handleUpload({
            file: identityFile,
            fileType: identityType,
            metadata: identityMeta,
            setStatus: setIdentityStatus,
            setUploadedUrl: setIdentityUploadedUrl,
            setUploading: setIdentityUploading,
            setFile: setIdentityFile,
            onSuccess: advanceSection
          })
      })}

      {/* Police Clearance */}
      {activeSection >= 1 && renderUploadSection({
        title: 'Police Clearance Certificate',
        file: policeFile,
        previewUrl: policePreviewUrl,
        status: policeStatus,
        uploadedUrl: policeUploadedUrl,
        uploading: policeUploading,
        extraFields: (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Certificate Number</label>
              <input
                type="text"
                value={policeMeta.certificateNumber}
                onChange={(event) => setPoliceMeta((prev) => ({ ...prev, certificateNumber: event.target.value }))}
                placeholder="e.g., PCC-2024-001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Issue Date</label>
              <input
                type="date"
                value={policeMeta.issueDate}
                onChange={(event) => setPoliceMeta((prev) => ({ ...prev, issueDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={policeMeta.expiryDate}
                onChange={(event) => setPoliceMeta((prev) => ({ ...prev, expiryDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </>
        ),
        onFileChange: (event) =>
          handleFileChange(event, setPoliceFile, setPoliceStatus, setPoliceUploadedUrl),
        onUpload: () =>
          handleUpload({
            file: policeFile,
            fileType: 'PoliceClearance',
            metadata: policeMeta,
            setStatus: setPoliceStatus,
            setUploadedUrl: setPoliceUploadedUrl,
            setUploading: setPoliceUploading,
            setFile: setPoliceFile,
            onSuccess: advanceSection
          })
      })}

      {/* NVQ / Qualifications */}
      {activeSection >= 2 && (
        <>
          <h4 className="text-sm font-semibold text-gray-900">NVQ / Other Qualification</h4>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            If you are unable to add valid certification which is mentioned under profile section, your profile will be rejected.
          </div>

          {normalizedCertifications.length === 0 ? (
            renderUploadSection({
              title: 'NVQ / Other Qualification',
              file: qualificationFile,
              previewUrl: qualificationPreviewUrl,
              status: qualificationStatus,
              uploadedUrl: qualificationUploadedUrl,
              uploading: qualificationUploading,
              onFileChange: (event) =>
                handleFileChange(event, setQualificationFile, setQualificationStatus, setQualificationUploadedUrl),
              onUpload: () =>
                handleUpload({
                  file: qualificationFile,
                  fileType: 'Qualification',
                  metadata: {},
                  setStatus: setQualificationStatus,
                  setUploadedUrl: setQualificationUploadedUrl,
                  setUploading: setQualificationUploading,
                  setFile: setQualificationFile
                })
            })
          ) : (
            <div className="space-y-3">
              {qualificationItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Upload the certificate(s) for this qualification.</p>
                    </div>
                  </div>

                  {/* Multi-file input */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="inline h-4 w-4 mr-2" />
                      Select Files <span className="text-xs text-gray-400 font-normal">(multiple allowed)</span>
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.docx"
                      multiple
                      onChange={(event) => handleQualificationFileSelect(event, item.name)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  {/* Selected files list */}
                  {item.files && item.files.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {item.files.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700"
                        >
                          <span className="truncate mr-2">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => handleQualificationFileRemove(item.name, i)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Upload button */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQualificationUpload(item)}
                      disabled={item.uploading || !item.files || item.files.length === 0}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {item.uploading
                        ? 'Uploading...'
                        : `Upload File${item.files && item.files.length > 1 ? 's' : ''}`}
                    </button>

                    {/* Previously uploaded files */}
                    {item.uploadedUrls && item.uploadedUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.uploadedUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-700 underline"
                          >
                            View file {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status message */}
                  {item.status.text && (
                    <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                      item.status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {item.status.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DocumentUploadCard