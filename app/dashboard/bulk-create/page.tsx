import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import BulkUploader from '@/components/qr/BulkUploader';
import { FiUploadCloud, FiInfo } from 'react-icons/fi';

export default async function BulkCreatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-xl flex items-center justify-center">
            <FiUploadCloud className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Create</h1>
            <p className="text-gray-600">Create multiple QR codes from a CSV file</p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <FiInfo className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-800">
            <p className="font-medium">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Download the CSV template to see the required format</li>
              <li>Fill in your data (type and content are required)</li>
              <li>Upload your CSV file</li>
              <li>Review the preview and fix any errors</li>
              <li>Click Create to generate all QR codes</li>
              <li>Download the ZIP file with all your QR codes</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="font-medium">Supported QR types:</p>
              <p className="text-blue-700">
                url, text, email, phone, sms, wifi, vcard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <BulkUploader />
      </div>
    </div>
  );
}
