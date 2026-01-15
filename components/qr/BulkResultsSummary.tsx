'use client';

import { BulkCreateResponse, BulkQRCreated } from '@/types/bulk';
import { FiCheckCircle, FiXCircle, FiDownload, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';

interface BulkResultsSummaryProps {
  results: BulkCreateResponse;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export default function BulkResultsSummary({
  results,
  onDownloadZip,
  isDownloading,
}: BulkResultsSummaryProps) {
  const [showCreated, setShowCreated] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const allSuccess = results.totalFailed === 0;

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`p-6 rounded-xl ${
        allSuccess
          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
          : 'bg-gradient-to-r from-orange-500 to-amber-500'
      } text-white`}>
        <div className="flex items-center gap-4">
          {allSuccess ? (
            <FiCheckCircle className="text-4xl" />
          ) : (
            <FiXCircle className="text-4xl" />
          )}
          <div>
            <h3 className="text-xl font-bold">
              {allSuccess ? 'All QR Codes Created Successfully!' : 'Bulk Creation Completed with Errors'}
            </h3>
            <p className="text-white/80 mt-1">
              {results.totalCreated} created
              {results.totalFailed > 0 && `, ${results.totalFailed} failed`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{results.totalCreated}</p>
              <p className="text-sm text-green-600">Created</p>
            </div>
          </div>
        </div>

        {results.totalFailed > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{results.totalFailed}</p>
                <p className="text-sm text-red-600">Failed</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Created List (Collapsible) */}
      {results.created.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowCreated(!showCreated)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">
              Created QR Codes ({results.created.length})
            </span>
            {showCreated ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showCreated && (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {results.created.map((qr: BulkQRCreated) => (
                <div key={qr.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {qr.description || `QR #${qr.index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">{qr.shortUrl}</p>
                  </div>
                  <FiCheckCircle className="text-green-500 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Failed List (Collapsible) */}
      {results.failed.length > 0 && (
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowFailed(!showFailed)}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span className="font-medium text-red-700">
              Failed Items ({results.failed.length})
            </span>
            {showFailed ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showFailed && (
            <div className="divide-y divide-red-100 max-h-60 overflow-y-auto">
              {results.failed.map((item) => (
                <div key={item.index} className="px-4 py-3 bg-red-50/50">
                  <p className="font-medium text-red-700">Row #{item.index + 1}</p>
                  <p className="text-sm text-red-600">{item.error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {results.totalCreated > 0 && (
          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                Generating ZIP...
              </>
            ) : (
              <>
                <FiDownload className="text-lg" />
                Download ZIP ({results.totalCreated} QRs)
              </>
            )}
          </button>
        )}

        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <FiExternalLink className="text-lg" />
          View in Dashboard
        </Link>
      </div>
    </div>
  );
}
