import React, { useState } from 'react'
import { caregiverService } from '../../services/api'

const CaregiverFileUploads = () => {
  const [profileFile, setProfileFile] = useState(null)
  const [verificationFile, setVerificationFile] = useState(null)
  const [status, setStatus] = useState('')

  // Upload a public profile image to the backend.
  const handleProfileUpload = async () => {
    if (!profileFile) {
      setStatus('Select a profile image first.')
      return
    }

    try {
      setStatus('Uploading profile image...')
      const response = await caregiverService.uploadProfileImage(profileFile)
      setStatus(`Profile image uploaded: ${response.data.data.url}`)
      setProfileFile(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Profile image upload failed.'
      setStatus(message)
    }
  }

  // Upload a private verification document to the backend.
  const handleVerificationUpload = async () => {
    if (!verificationFile) {
      setStatus('Select a verification document first.')
      return
    }

    try {
      setStatus('Uploading verification document...')
      const response = await caregiverService.uploadVerificationDocument(verificationFile)
      setStatus(`Verification document uploaded: ${response.data.data.url}`)
      setVerificationFile(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Verification upload failed.'
      setStatus(message)
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Profile Image</h2>
        <p className="text-sm text-slate-600">Images only, up to 5MB.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setProfileFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          />
          <button
            type="button"
            onClick={handleProfileUpload}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Upload
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Verification Document</h2>
        <p className="text-sm text-slate-600">Images or PDFs, up to 5MB.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => setVerificationFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          />
          <button
            type="button"
            onClick={handleVerificationUpload}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Upload
          </button>
        </div>
      </div>

      {status ? (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{status}</p>
      ) : null}
    </div>
  )
}

export default CaregiverFileUploads
