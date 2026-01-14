'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { FiTrendingUp, FiSmartphone, FiGlobe, FiCalendar, FiEye } from 'react-icons/fi'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface AnalyticsData {
  totalScans: number
  totalQRCodes: number
  scansByDate: { date: string; scans: number }[]
  scansByDevice: { name: string; value: number }[]
  scansByBrowser: { name: string; value: number }[]
  scansByOS: { name: string; value: number }[]
  scansByCountry: { name: string; value: number }[]
  topQRCodes: { id: string; description: string; scans: number }[]
  growth: number
}

const COLORS = ['#f5576c', '#4facfe', '#43e97b', '#fa709a', '#667eea', '#f093fb', '#00f2fe', '#38f9d7']

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30) // días

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics?days=${dateRange}`)
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session, dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar las analíticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Estadísticas detalladas de tus códigos QR</p>
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f5576c] focus:border-transparent"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={365}>Último año</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={FiEye}
          label="Total Escaneos"
          value={analytics.totalScans}
          color="from-[#4facfe] to-[#00f2fe]"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Crecimiento"
          value={`${analytics.growth >= 0 ? '+' : ''}${analytics.growth.toFixed(1)}%`}
          isText
          color={analytics.growth >= 0 ? "from-[#43e97b] to-[#38f9d7]" : "from-[#f5576c] to-[#f093fb]"}
        />
        <StatCard
          icon={FiSmartphone}
          label="Dispositivo Top"
          value={analytics.scansByDevice[0]?.name || 'N/A'}
          isText
          color="from-[#fa709a] to-[#fee140]"
        />
        <StatCard
          icon={FiGlobe}
          label="País Top"
          value={analytics.scansByCountry[0]?.name || 'N/A'}
          isText
          color="from-[#667eea] to-[#764ba2]"
        />
      </div>

      {/* Scans Over Time Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Escaneos por Día</h2>
        {analytics.scansByDate.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.scansByDate}>
              <defs>
                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5576c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f5576c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#f5576c"
                strokeWidth={2}
                fill="url(#colorScans)"
                name="Escaneos"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No hay datos de escaneos para este período
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Por Dispositivo</h2>
          {analytics.scansByDevice.length > 0 && analytics.scansByDevice.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.scansByDevice.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {analytics.scansByDevice.filter(d => d.value > 0).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No hay datos de dispositivos
            </div>
          )}
        </div>

        {/* Browser Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Por Navegador</h2>
          {analytics.scansByBrowser.length > 0 && analytics.scansByBrowser.some(b => b.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.scansByBrowser.filter(b => b.value > 0).slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={80}
                />
                <Tooltip />
                <Bar dataKey="value" name="Escaneos" radius={[0, 4, 4, 0]}>
                  {analytics.scansByBrowser.filter(b => b.value > 0).slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No hay datos de navegadores
            </div>
          )}
        </div>

        {/* OS Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Por Sistema Operativo</h2>
          {analytics.scansByOS.length > 0 && analytics.scansByOS.some(o => o.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.scansByOS.filter(o => o.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {analytics.scansByOS.filter(o => o.value > 0).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No hay datos de sistemas operativos
            </div>
          )}
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Por País</h2>
          {analytics.scansByCountry.length > 0 && analytics.scansByCountry.some(c => c.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.scansByCountry.filter(c => c.value > 0).slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="value" name="Escaneos" radius={[0, 4, 4, 0]}>
                  {analytics.scansByCountry.filter(c => c.value > 0).slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No hay datos de países
            </div>
          )}
        </div>
      </div>

      {/* Top QR Codes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">QR Codes Más Escaneados</h2>
        {analytics.topQRCodes.length > 0 ? (
          <div className="space-y-4">
            {analytics.topQRCodes.map((qr, index) => (
              <div
                key={qr.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/qr-codes/${qr.id}`)}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {qr.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{qr.scans}</p>
                  <p className="text-xs text-gray-500">escaneos</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay QR codes con escaneos
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isText = false,
}: {
  icon: any
  label: string
  value: number | string
  color: string
  isText?: boolean
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white text-2xl" />
        </div>
        <div className="min-w-0">
          <p className={`${isText ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 truncate`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
