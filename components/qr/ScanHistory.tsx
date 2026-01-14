'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiChevronDown, FiChevronUp, FiDownload, FiCalendar, FiClock, FiFilter } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Scan {
  id: string
  scannedAt: string
  deviceType: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

interface ScanHistoryProps {
  qrCodeId: string
  qrDescription?: string
}

export default function ScanHistory({ qrCodeId, qrDescription }: ScanHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [scans, setScans] = useState<Scan[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '' })

  const fetchScans = useCallback(async (page: number, filters: { startDate: string; endDate: string }) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      })
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/qr/${qrCodeId}/scans?${params}`)
      if (!response.ok) throw new Error('Failed to fetch scans')

      const data = await response.json()
      setScans(data.scans)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching scan history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [qrCodeId])

  useEffect(() => {
    if (isExpanded && scans.length === 0) {
      fetchScans(1, appliedFilters)
    }
  }, [isExpanded, scans.length, fetchScans, appliedFilters])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchScans(newPage, appliedFilters)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ startDate, endDate })
    setCurrentPage(1)
    fetchScans(1, { startDate, endDate })
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setAppliedFilters({ startDate: '', endDate: '' })
    setCurrentPage(1)
    fetchScans(1, { startDate: '', endDate: '' })
  }

  const handleExportCSV = async () => {
    try {
      // Fetch all scans for export
      const params = new URLSearchParams({ limit: '10000' })
      if (appliedFilters.startDate) params.append('startDate', appliedFilters.startDate)
      if (appliedFilters.endDate) params.append('endDate', appliedFilters.endDate)

      const response = await fetch(`/api/qr/${qrCodeId}/scans?${params}`)
      if (!response.ok) throw new Error('Failed to fetch scans for export')

      const data = await response.json()
      const allScans: Scan[] = data.scans

      // Generate CSV
      const headers = ['Fecha', 'Hora', 'Dispositivo', 'Navegador', 'Sistema Operativo', 'País', 'Ciudad']
      const rows = allScans.map(scan => {
        const date = new Date(scan.scannedAt)
        return [
          format(date, 'dd/MM/yyyy'),
          format(date, 'HH:mm:ss'),
          scan.deviceType || 'Desconocido',
          scan.browser || 'Desconocido',
          scan.os || 'Desconocido',
          scan.country || 'Desconocido',
          scan.city || 'Desconocido',
        ].join(',')
      })

      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `historial-scans-${qrDescription || qrCodeId}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const hasActiveFilters = appliedFilters.startDate || appliedFilters.endDate

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
            <FiClock className="text-white text-lg" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-900">Historial de Escaneos</h2>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.totalCount} escaneos registrados` : 'Ver cuándo se escaneó este QR'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-[#f5576c]/10 text-[#f5576c] text-xs rounded-full font-medium">
              Filtrado
            </span>
          )}
          {isExpanded ? (
            <FiChevronUp className="text-gray-400 text-xl" />
          ) : (
            <FiChevronDown className="text-gray-400 text-xl" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Toolbar */}
          <div className="px-6 py-3 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#f5576c]/10 text-[#f5576c]'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiFilter />
              Filtrar por fecha
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!pagination || pagination.totalCount === 0}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload />
              Exportar CSV
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Aplicar
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scans list */}
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f5576c]/30 border-t-[#f5576c]"></div>
              </div>
            ) : scans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="mx-auto text-3xl mb-2 text-gray-300" />
                <p>No hay escaneos registrados</p>
                {hasActiveFilters && (
                  <p className="text-sm mt-1">Intenta ajustar los filtros de fecha</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {scans.map((scan) => {
                    const date = new Date(scan.scannedAt)
                    return (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-lg font-bold text-gray-900">
                              {format(date, 'd')}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">
                              {format(date, 'MMM', { locale: es })}
                            </p>
                          </div>
                          <div className="h-10 w-px bg-gray-200"></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(date, 'HH:mm:ss')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(date, 'EEEE', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {scan.deviceType && scan.deviceType !== 'unknown' && (
                            <p>{scan.deviceType}</p>
                          )}
                          {scan.city && scan.country && (
                            <p>{scan.city}, {scan.country}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Página {pagination.page} de {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasMore}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
