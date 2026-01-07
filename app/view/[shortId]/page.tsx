import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FiCopy, FiWifi, FiUser, FiMail, FiPhone } from 'react-icons/fi'

export default async function ViewQRPage({
  params,
}: {
  params: Promise<{ shortId: string }>
}) {
  const { shortId } = await params

  const qrCode = await prisma.qRCode.findUnique({
    where: { shortId },
  })

  if (!qrCode) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5576c] via-[#f093fb] to-[#4facfe] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {qrCode.type === 'TEXT' && (
          <TextContent content={qrCode.content} description={qrCode.description} />
        )}
        {qrCode.type === 'WIFI' && (
          <WiFiContent content={qrCode.content} description={qrCode.description} />
        )}
        {qrCode.type === 'VCARD' && (
          <VCardContent content={qrCode.content} description={qrCode.description} />
        )}
      </div>
    </div>
  )
}

function TextContent({ content, description }: { content: string; description?: string | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#f5576c] to-[#f093fb] p-3 rounded-xl">
          <FiCopy className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Text Content</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(content)}
        className="w-full bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <FiCopy /> Copy to Clipboard
      </button>
    </div>
  )
}

function WiFiContent({ content, description }: { content: string; description?: string | null }) {
  // Parse WiFi string: WIFI:T:WPA;S:NetworkName;P:Password;;
  const ssidMatch = content.match(/S:([^;]+)/)
  const passwordMatch = content.match(/P:([^;]+)/)
  const encryptionMatch = content.match(/T:([^;]+)/)

  const ssid = ssidMatch?.[1] || 'Unknown'
  const password = passwordMatch?.[1] || 'None'
  const encryption = encryptionMatch?.[1] || 'None'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] p-3 rounded-xl">
          <FiWifi className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WiFi Network</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600 font-medium">Network Name (SSID)</label>
          <p className="text-lg text-gray-900 font-semibold">{ssid}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">Password</label>
          <p className="text-lg text-gray-900 font-mono">{password}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">Security</label>
          <p className="text-lg text-gray-900">{encryption}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 text-center">
        Connect to this network manually using the credentials above
      </p>
    </div>
  )
}

function VCardContent({ content, description }: { content: string; description?: string | null }) {
  // Parse vCard format
  const lines = content.split('\n')
  const name = lines.find(l => l.startsWith('FN:'))?.replace('FN:', '') || 'Unknown'
  const phone = lines.find(l => l.startsWith('TEL:'))?.replace('TEL:', '') || ''
  const email = lines.find(l => l.startsWith('EMAIL:'))?.replace('EMAIL:', '') || ''
  const org = lines.find(l => l.startsWith('ORG:'))?.replace('ORG:', '') || ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#f5576c] to-[#8538a6] p-3 rounded-xl">
          <FiUser className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600 font-medium">Name</label>
          <p className="text-xl text-gray-900 font-semibold">{name}</p>
        </div>
        {phone && (
          <div className="flex items-center gap-3">
            <FiPhone className="text-gray-600" />
            <div>
              <label className="text-sm text-gray-600 font-medium">Phone</label>
              <p className="text-lg text-gray-900">{phone}</p>
            </div>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-3">
            <FiMail className="text-gray-600" />
            <div>
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <p className="text-lg text-gray-900">{email}</p>
            </div>
          </div>
        )}
        {org && (
          <div>
            <label className="text-sm text-gray-600 font-medium">Organization</label>
            <p className="text-lg text-gray-900">{org}</p>
          </div>
        )}
      </div>
      <button
        onClick={() => {
          const blob = new Blob([content], { type: 'text/vcard' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${name.replace(/\s/g, '_')}.vcf`
          a.click()
        }}
        className="w-full bg-gradient-to-r from-[#f5576c] to-[#8538a6] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <FiUser /> Save Contact
      </button>
    </div>
  )
}
