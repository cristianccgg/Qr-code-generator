'use client';

import { useState } from 'react';
import { FiCheckSquare, FiSquare, FiDownload, FiGrid, FiInfo } from 'react-icons/fi';
import { LabelLayout, LABEL_LAYOUTS } from '@/types/export';
import { downloadLabelsPDF } from '@/lib/pdf-generator';
import { generateQRCode } from '@/lib/qr-generator';

interface QRCodeData {
  id: string;
  shortId: string;
  content: string;
  description: string | null;
  color: string;
  backgroundColor: string;
  size: number;
  dotStyle: string | null;
  cornerStyle: string | null;
  cornerDotStyle: string | null;
  cornerColor: string | null;
  gradientEnabled: boolean;
  gradientType: string | null;
  gradientStart: string | null;
  gradientEnd: string | null;
  gradientRotation: number | null;
}

interface LabelsGeneratorProps {
  qrCodes: QRCodeData[];
}

export default function LabelsGenerator({ qrCodes }: LabelsGeneratorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<LabelLayout>('2x4');
  const [includeDescription, setIncludeDescription] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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

  const selectedLayout = LABEL_LAYOUTS.find((l) => l.id === layout)!;
  const selectedQRs = qrCodes.filter((qr) => selectedIds.includes(qr.id));
  const totalPages = Math.ceil(selectedQRs.length / selectedLayout.labelsPerPage);

  const handleGenerate = async () => {
    if (selectedQRs.length === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: selectedQRs.length });

    try {
      const qrDataUrls: { dataUrl: string; description?: string }[] = [];

      for (let i = 0; i < selectedQRs.length; i++) {
        const qr = selectedQRs[i];
        setProgress({ current: i + 1, total: selectedQRs.length });

        const dataUrl = await generateQRCode({
          content: qr.content,
          color: qr.color || '#000000',
          backgroundColor: qr.backgroundColor || '#FFFFFF',
          size: qr.size || 512,
          dotStyle: (qr.dotStyle as any) || undefined,
          cornerStyle: (qr.cornerStyle as any) || undefined,
          cornerDotStyle: (qr.cornerDotStyle as any) || undefined,
          cornerColor: qr.cornerColor || undefined,
          gradientEnabled: qr.gradientEnabled || false,
          gradientType: (qr.gradientType as any) || undefined,
          gradientColorStart: qr.gradientStart || undefined,
          gradientColorEnd: qr.gradientEnd || undefined,
          gradientRotation: qr.gradientRotation || undefined,
        });

        qrDataUrls.push({
          dataUrl,
          description: qr.description || undefined,
        });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      await downloadLabelsPDF(qrDataUrls, `qr-labels-${timestamp}.pdf`, {
        layout,
        includeDescription,
      });
    } catch (error) {
      console.error('Error generating labels:', error);
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  if (qrCodes.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiGrid className="text-2xl text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
        <p className="text-gray-600">Create some QR codes first to generate labels</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Layout Selection */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Choose Layout</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LABEL_LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                layout === l.id
                  ? 'border-[#f5576c] bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <FiGrid className={layout === l.id ? 'text-[#f5576c]' : 'text-gray-400'} />
                <span className={`font-semibold ${layout === l.id ? 'text-[#f5576c]' : 'text-gray-700'}`}>
                  {l.name}
                </span>
              </div>
              <p className="text-xs text-gray-500">{l.description}</p>
              <p className="text-xs text-gray-400 mt-1">{l.labelsPerPage} per page</p>
            </button>
          ))}
        </div>

        {/* Include Description Option */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDescription}
            onChange={(e) => setIncludeDescription(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#f5576c] focus:ring-[#f5576c]"
          />
          <span className="text-sm text-gray-700">Include descriptions below QR codes</span>
        </label>
      </div>

      {/* QR Selection */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">2. Select QR Codes</h3>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-[#f5576c] hover:text-[#d64560] font-medium"
          >
            {selectedIds.length === qrCodes.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
          {qrCodes.map((qr) => {
            const isSelected = selectedIds.includes(qr.id);
            return (
              <button
                key={qr.id}
                onClick={() => toggleSelection(qr.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-[#f5576c] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded"
                    style={{
                      backgroundColor: qr.backgroundColor,
                      border: `2px solid ${qr.color}`,
                    }}
                  />
                  {isSelected ? (
                    <FiCheckSquare className="text-[#f5576c]" />
                  ) : (
                    <FiSquare className="text-gray-300" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">
                  {qr.description || qr.shortId}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary & Generate */}
      <div className="p-6 bg-gray-50">
        {selectedIds.length > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiInfo className="text-gray-400" />
                <span>
                  <strong>{selectedQRs.length}</strong> QR codes selected
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {totalPages} page{totalPages > 1 ? 's' : ''} ({selectedLayout.labelsPerPage} per page)
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  Generating ({progress.current}/{progress.total})...
                </>
              ) : (
                <>
                  <FiDownload />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">Select QR codes to generate labels</p>
        )}
      </div>
    </div>
  );
}
