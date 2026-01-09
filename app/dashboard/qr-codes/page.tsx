import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QRCode } from "@prisma/client";
import Link from "next/link";
import { FiGrid, FiEye, FiCalendar } from "react-icons/fi";
import { redirect } from "next/navigation";
import QRCodesList from "@/components/qr/QRCodesList";

export default async function QRCodesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const qrCodes = (await prisma.qRCode.findMany({
    where: { userId: session.user.id },
    include: {
      campaign: true,
      _count: {
        select: { scans: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as (QRCode & { _count: { scans: number }; campaign: any })[];

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
                  (acc: number, qr: (typeof qrCodes)[0]): number =>
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

        <QRCodesList qrCodes={qrCodes} />
      </div>
    </div>
  );
}
