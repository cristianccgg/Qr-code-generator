'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiFolder, FiGrid, FiEye, FiExternalLink, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface QRCode {
  id: string
  shortId: string
  type: string
  description: string | null
  destinationUrl: string | null
  content: string
  createdAt: string
  _count: {
    scans: number
  }
}

interface Campaign {
  id: string
  name: string
  description: string | null
  createdAt: string
  qrCodes: QRCode[]
  _count: {
    qrCodes: number
  }
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setCampaign(data)
      } catch (error) {
        console.error('Error fetching campaign:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchCampaign()
    }
  }, [id, session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Campaña no encontrada</p>
        <Link href="/dashboard/campaigns" className="text-[#f5576c] hover:underline mt-2 inline-block">
          Volver a campañas
        </Link>
      </div>
    )
  }

  const totalScans = campaign.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft />
        Volver a campañas
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center flex-shrink-0">
            <FiFolder className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-600 mt-1">{campaign.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Creada el {new Date(campaign.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-xl flex items-center justify-center">
              <FiGrid className="text-white text-xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{campaign._count.qrCodes}</p>
              <p className="text-sm text-gray-600">Códigos QR</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center">
              <FiEye className="text-white text-xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalScans}</p>
              <p className="text-sm text-gray-600">Escaneos totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Códigos QR en esta campaña</h2>
        </div>

        {campaign.qrCodes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGrid className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay QR codes</h3>
            <p className="text-gray-600 mb-4">Esta campaña aún no tiene códigos QR asociados</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Crear QR Code
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaign.qrCodes.map((qr) => (
              <Link
                key={qr.id}
                href={`/dashboard/qr-codes/${qr.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {qr.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {qr.type}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {qr.destinationUrl || qr.content}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{qr._count.scans}</p>
                    <p className="text-xs text-gray-500">escaneos</p>
                  </div>
                  <FiExternalLink className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
