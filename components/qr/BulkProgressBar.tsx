'use client';

import { BulkProgress } from '@/types/bulk';

interface BulkProgressBarProps {
  progress: BulkProgress;
}

export default function BulkProgressBar({ progress }: BulkProgressBarProps) {
  const percentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#f5576c] to-[#f093fb] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* Spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#f5576c]/30 border-t-[#f5576c]" />
          </div>
          <span className="text-gray-700 font-medium">
            Creating QR {progress.current} of {progress.total}...
          </span>
        </div>
        <span className="text-gray-500 font-semibold">
          {percentage}%
        </span>
      </div>

      {/* Current item */}
      {progress.currentItem && (
        <p className="text-xs text-gray-500 truncate">
          Processing: {progress.currentItem}
        </p>
      )}
    </div>
  );
}
