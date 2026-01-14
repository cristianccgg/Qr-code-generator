'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiEdit2, FiSave, FiX, FiDownload, FiExternalLink, FiBarChart2, FiCalendar, FiEye, FiTrash2 } from 'react-icons/fi'
import { generateQRCode } from '@/lib/qr-generator'
import ScanHistory from '@/components/qr/ScanHistory'

interface QRCode {
  id: string
  shortId: string
  type: string
  content: string
  description: string | null
  color: string
  backgroundColor: string
  size: number
  format: string
  logoUrl: string | null
  isDynamic: boolean
  destinationUrl: string | null
  createdAt: string
  updatedAt: string
  _count: {
    scans: number
  }
}

export default function QRCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [qrCode, setQrCode] = useState<QRCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUrl, setEditedUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/qr/${id}`)
        if (!response.ok) throw new Error('Failed to fetch QR code')
        const data = await response.json()
        setQrCode(data)
        setEditedUrl(data.destinationUrl || data.content)

        // Generate QR code image
        const qrImage = await generateQRCode({
          content: data.content,
          color: data.color,
          backgroundColor: data.backgroundColor,
          size: 256,
          logo: data.logoUrl,
        })
        setQrDataURL(qrImage)
      } catch (error) {
        console.error('Error fetching QR code:', error)
        setErrorMessage('Failed to load QR code')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchQRCode()
    }
  }, [id, session])

  const handleSave = async () => {
    if (!editedUrl.trim()) {
      setErrorMessage('URL cannot be empty')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationUrl: editedUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to update QR code')

      const updatedQR = await response.json()
      setQrCode(updatedQR)
      setIsEditing(false)
      setSuccessMessage('URL updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating QR code:', error)
      setErrorMessage('Failed to update URL')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!qrCode) return

    try {
      const link = document.createElement('a')
      link.download = `${qrCode.description || 'qr-code'}.${qrCode.format.toLowerCase()}`
      link.href = qrDataURL
      link.click()
      setSuccessMessage('QR code downloaded!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      setErrorMessage('Failed to download QR code')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete QR code')

      setSuccessMessage('QR code deleted successfully!')
      setTimeout(() => {
        router.push('/dashboard/qr-codes')
      }, 1000)
    } catch (error) {
      console.error('Error deleting QR code:', error)
      setErrorMessage('Failed to delete QR code')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">QR code not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {qrCode.description || 'Untitled QR Code'}
          </h1>
          <p className="text-gray-600 mt-1">View and edit your QR code details</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <FiTrash2 />
            Delete
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <FiDownload />
            Download
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete QR Code?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this QR code? This action cannot be undone and all scan data will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center">
              <FiEye className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{qrCode._count.scans}</p>
              <p className="text-sm text-gray-600">Total Scans</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#43e97b] to-[#38f9d7] rounded-xl flex items-center justify-center">
              <FiCalendar className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {new Date(qrCode.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Created</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fa709a] to-[#fee140] rounded-xl flex items-center justify-center">
              <FiBarChart2 className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{qrCode.type}</p>
              <p className="text-sm text-gray-600">Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Code Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">QR Code Preview</h2>
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64 bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100">
              {qrDataURL && (
                <Image
                  src={qrDataURL}
                  alt="QR Code"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Short URL</p>
              <code className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                {typeof window !== 'undefined' && `${window.location.origin}/r/${qrCode.shortId}`}
              </code>
            </div>
          </div>
        </div>

        {/* Details & Edit */}
        <div className="space-y-6">
          {/* Destination URL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Destination URL</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-[#f5576c] hover:bg-[#f5576c]/10 rounded-lg transition-colors"
                >
                  <FiEdit2 />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="url"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent"
                  placeholder="https://example.com"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <FiSave />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedUrl(qrCode.destinationUrl || qrCode.content)
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <FiExternalLink className="text-[#f5576c] flex-shrink-0" />
                <a
                  href={qrCode.destinationUrl || qrCode.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#f5576c] transition-colors break-all"
                >
                  {qrCode.destinationUrl || qrCode.content}
                </a>
              </div>
            )}
          </div>

          {/* QR Code Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Format</span>
                <span className="font-medium text-gray-900">{qrCode.format}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Size</span>
                <span className="font-medium text-gray-900">{qrCode.size}×{qrCode.size}px</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Dynamic</span>
                <span className="font-medium text-gray-900">{qrCode.isDynamic ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Colors</span>
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: qrCode.color }}
                    title={`QR Color: ${qrCode.color}`}
                  />
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: qrCode.backgroundColor }}
                    title={`Background: ${qrCode.backgroundColor}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan History */}
      <ScanHistory qrCodeId={id} qrDescription={qrCode.description || undefined} />
    </div>
  )
}
