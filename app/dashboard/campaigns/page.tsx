'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiFolder, FiPlus, FiEdit2, FiTrash2, FiX, FiGrid, FiEye } from 'react-icons/fi'

interface Campaign {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: {
    qrCodes: number
  }
}

export default function CampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchCampaigns()
  }, [session])

  const fetchCampaigns = async () => {
    if (!session) return
    try {
      const response = await fetch('/api/campaigns')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setFormData({ name: campaign.name, description: campaign.description || '' })
    } else {
      setEditingCampaign(null)
      setFormData({ name: '', description: '' })
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCampaign(null)
    setFormData({ name: '', description: '' })
    setError('')
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const url = editingCampaign
        ? `/api/campaigns/${editingCampaign.id}`
        : '/api/campaigns'

      const response = await fetch(url, {
        method: editingCampaign ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      handleCloseModal()
      fetchCampaigns()
    } catch (error) {
      console.error('Error saving campaign:', error)
      setError('Error al guardar la campaña')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setDeleteConfirm(null)
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-600 mt-1">Organiza tus códigos QR por proyecto o evento</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FiPlus />
          Nueva Campaña
        </button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFolder className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay campañas</h3>
          <p className="text-gray-600 mb-6">Crea tu primera campaña para organizar tus códigos QR</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <FiPlus />
            Crear Campaña
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
                    <FiFolder className="text-white text-xl" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(campaign)}
                      className="p-2 text-gray-400 hover:text-[#f5576c] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(campaign.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{campaign.name}</h3>
                {campaign.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiGrid />
                    <span>{campaign._count.qrCodes} QR codes</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/dashboard/campaigns/${campaign.id}`}
                className="block px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm font-medium text-[#f5576c] hover:bg-gray-100 transition-colors"
              >
                Ver detalles
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Exposición Verano 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional de la campaña..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : editingCampaign ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar campaña?</h3>
            <p className="text-gray-600 mb-6">
              Los códigos QR de esta campaña no se eliminarán, solo se desasociarán.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
