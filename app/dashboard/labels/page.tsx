import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LabelsGenerator from './LabelsGenerator';
import { FiTag } from 'react-icons/fi';

export default async function LabelsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Obtener QR codes del usuario
  const qrCodes = await prisma.qRCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      shortId: true,
      content: true,
      description: true,
      color: true,
      backgroundColor: true,
      size: true,
      dotStyle: true,
      cornerStyle: true,
      cornerDotStyle: true,
      cornerColor: true,
      gradientEnabled: true,
      gradientType: true,
      gradientStart: true,
      gradientEnd: true,
      gradientRotation: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-xl flex items-center justify-center">
            <FiTag className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Print Labels</h1>
            <p className="text-gray-600">Generate printable PDF with multiple QR codes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <LabelsGenerator qrCodes={qrCodes} />
      </div>
    </div>
  );
}
