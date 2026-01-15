"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiGrid,
  FiExternalLink,
  FiCalendar,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiDownload,
} from "react-icons/fi";
import type { QRCode } from "@prisma/client";
import ExportModal from "./ExportModal";

interface QRCodeWithCount extends QRCode {
  _count: { scans: number };
  campaign: any;
}

interface QRCodesListProps {
  qrCodes: QRCodeWithCount[];
}

export default function QRCodesList({ qrCodes }: QRCodesListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === qrCodes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(qrCodes.map((qr) => qr.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} QR code${
        selectedIds.length > 1 ? "s" : ""
      }?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/qr/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR codes");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      console.error("Error deleting QR codes:", error);
      alert("Failed to delete QR codes. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (qrCodes.length === 0) {
    return (
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
    );
  }

  const allSelected = selectedIds.length === qrCodes.length;

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiCheckSquare className="text-xl" />
            <span className="font-medium">
              {selectedIds.length} QR code{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FiDownload />
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Select All Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          {allSelected ? (
            <FiCheckSquare className="text-xl text-[#f5576c]" />
          ) : (
            <FiSquare className="text-xl" />
          )}
          <span>Select All ({qrCodes.length})</span>
        </button>
      </div>

      {/* QR Codes List */}
      <div className="divide-y divide-gray-100">
        {qrCodes.map((qr) => {
          const isSelected = selectedIds.includes(qr.id);

          return (
            <div
              key={qr.id}
              className={`p-6 transition-colors ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSelection(qr.id);
                  }}
                  className="flex-shrink-0"
                >
                  {isSelected ? (
                    <FiCheckSquare className="text-2xl text-[#f5576c]" />
                  ) : (
                    <FiSquare className="text-2xl text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                {/* QR Info - Clickable Link */}
                <Link
                  href={`/dashboard/qr-codes/${qr.id}`}
                  className="flex-1 min-w-0 flex items-center justify-between"
                >
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
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        qrCodes={qrCodes.filter((qr) => selectedIds.includes(qr.id))}
      />
    </>
  );
}
