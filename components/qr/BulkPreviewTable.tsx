'use client';

import { ParsedCSVRow } from '@/types/bulk';
import { FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

interface BulkPreviewTableProps {
  rows: ParsedCSVRow[];
  maxPreview?: number;
}

export default function BulkPreviewTable({ rows, maxPreview = 10 }: BulkPreviewTableProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? rows : rows.slice(0, maxPreview);
  const hasMore = rows.length > maxPreview;

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-green-600">
          <FiCheckCircle />
          <span>{validCount} valid</span>
        </div>
        {invalidCount > 0 && (
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle />
            <span>{invalidCount} with errors</span>
          </div>
        )}
        <span className="text-gray-500">
          ({rows.length} total rows)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Content</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayRows.map((row) => (
              <tr
                key={row.index}
                className={`${
                  row.isValid
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-red-50 hover:bg-red-100'
                } transition-colors`}
              >
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {row.index + 1}
                </td>
                <td className="px-4 py-3">
                  {row.isValid ? (
                    <FiCheckCircle className="text-green-500 text-lg" />
                  ) : (
                    <FiAlertCircle className="text-red-500 text-lg" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.isValid
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {row.data.type || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-gray-700" title={row.data.content}>
                  {row.data.content || '-'}
                </td>
                <td className="px-4 py-3 max-w-[150px] truncate text-gray-600" title={row.data.description}>
                  {row.data.description || '-'}
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  {row.errors.length > 0 ? (
                    <ul className="text-xs text-red-600 space-y-1">
                      {row.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more/less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mx-auto"
        >
          {expanded ? (
            <>
              <FiChevronUp />
              Show less
            </>
          ) : (
            <>
              <FiChevronDown />
              Show all {rows.length} rows
            </>
          )}
        </button>
      )}
    </div>
  );
}
