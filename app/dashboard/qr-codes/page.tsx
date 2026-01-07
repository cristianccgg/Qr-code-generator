import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FiGrid, FiExternalLink, FiEye, FiCalendar } from "react-icons/fi";
import { redirect } from "next/navigation";

export default async function QRCodesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const qrCodes = await prisma.qRCode.findMany({
    where: { userId: session.user.id },
    include: {
      campaign: true,
      _count: {
        select: { scans: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My QR Codes</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your QR codes
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create New QR
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-xl flex items-center justify-center">
              <FiGrid className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {qrCodes.length}
              </p>
              <p className="text-sm text-gray-600">Total QR Codes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center">
              <FiEye className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {qrCodes.reduce(
                  (acc: number, qr: (typeof qrCodes)[0]) =>
                    acc + qr._count.scans,
                  0
                )}
              </p>
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
              <p className="text-3xl font-bold text-gray-900">
                {
                  qrCodes.filter((qr) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(qr.createdAt) > weekAgo;
                  }).length
                }
              </p>
              <p className="text-sm text-gray-600">Created This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All QR Codes</h2>
        </div>

        {qrCodes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGrid className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No QR codes yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first QR code to get started
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create QR Code
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {qrCodes.map((qr) => (
              <Link
                key={qr.id}
                href={`/dashboard/qr-codes/${qr.id}`}
                className="p-6 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {qr.description || "Untitled QR Code"}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {qr.type}
                      </span>
                      {qr.campaign && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {qr.campaign.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiExternalLink className="text-[#f5576c]" />
                        <span className="truncate max-w-md">
                          {qr.destinationUrl || qr.content}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar />
                        <span>
                          {new Date(qr.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {qr._count.scans}
                      </p>
                      <p className="text-xs text-gray-500">scans</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div
                        className="w-12 h-12 rounded"
                        style={{
                          backgroundColor: qr.backgroundColor,
                          border: `2px solid ${qr.color}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
