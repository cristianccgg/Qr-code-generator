'use client';

import { useState } from 'react';
import { FiX, FiDownload, FiGrid, FiFile, FiArchive } from 'react-icons/fi';
import {
  LabelLayout,
  LABEL_LAYOUTS,
  ExportFormat,
  DEFAULT_LABELS_PDF_OPTIONS,
  DEFAULT_BATCH_OPTIONS,
} from '@/types/export';
import { downloadLabelsPDF, downloadMultiPagePDF, downloadBlob } from '@/lib/pdf-generator';
import { generateQRCode } from '@/lib/qr-generator';
import JSZip from 'jszip';

interface ExportableQR {
  id: string;
  shortId: string;
  content: string;
  description?: string | null;
  color: string;
  backgroundColor: string;
  size: number;
  dotStyle?: string | null;
  cornerStyle?: string | null;
  cornerDotStyle?: string | null;
  cornerColor?: string | null;
  gradientEnabled?: boolean;
  gradientType?: string | null;
  gradientStart?: string | null;
  gradientEnd?: string | null;
  gradientRotation?: number | null;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodes: ExportableQR[];
}

type ExportMode = 'labels' | 'multipage' | 'zip';

export default function ExportModal({ isOpen, onClose, qrCodes }: ExportModalProps) {
  const [mode, setMode] = useState<ExportMode>('labels');
  const [layout, setLayout] = useState<LabelLayout>('2x4');
  const [includeDescription, setIncludeDescription] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  if (!isOpen) return null;

  const generateQRDataUrls = async (): Promise<{ dataUrl: string; description?: string }[]> => {
    const results: { dataUrl: string; description?: string }[] = [];

    for (let i = 0; i < qrCodes.length; i++) {
      const qr = qrCodes[i];
      setProgress({ current: i + 1, total: qrCodes.length });

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

      results.push({
        dataUrl,
        description: qr.description || undefined,
      });
    }

    return results;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: qrCodes.length });

    try {
      const qrDataUrls = await generateQRDataUrls();
      const timestamp = new Date().toISOString().split('T')[0];

      if (mode === 'labels') {
        await downloadLabelsPDF(qrDataUrls, `qr-labels-${timestamp}.pdf`, {
          layout,
          includeDescription,
        });
      } else if (mode === 'multipage') {
        await downloadMultiPagePDF(qrDataUrls, `qr-codes-${timestamp}.pdf`, {
          includeDescription,
        });
      } else if (mode === 'zip') {
        const zip = new JSZip();
        const folder = zip.folder('qr-codes');

        qrDataUrls.forEach((qr, index) => {
          const base64 = qr.dataUrl.split(',')[1];
          const filename = qr.description
            ? `${qr.description.replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.png`
            : `qr_${index + 1}.png`;
          folder?.file(filename, base64, { base64: true });
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, `qr-codes-${timestamp}.zip`);
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const selectedLayout = LABEL_LAYOUTS.find(l => l.id === layout);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export QR Codes</h2>
            <p className="text-sm text-gray-500 mt-1">{qrCodes.length} QR codes selected</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMode('labels')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'labels'
                    ? 'border-[#f5576c] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiGrid className={`text-2xl mx-auto mb-2 ${mode === 'labels' ? 'text-[#f5576c]' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${mode === 'labels' ? 'text-[#f5576c]' : 'text-gray-600'}`}>Labels PDF</p>
              </button>

              <button
                onClick={() => setMode('multipage')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'multipage'
                    ? 'border-[#f5576c] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiFile className={`text-2xl mx-auto mb-2 ${mode === 'multipage' ? 'text-[#f5576c]' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${mode === 'multipage' ? 'text-[#f5576c]' : 'text-gray-600'}`}>Multi-page</p>
              </button>

              <button
                onClick={() => setMode('zip')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'zip'
                    ? 'border-[#f5576c] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiArchive className={`text-2xl mx-auto mb-2 ${mode === 'zip' ? 'text-[#f5576c]' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${mode === 'zip' ? 'text-[#f5576c]' : 'text-gray-600'}`}>ZIP (PNG)</p>
              </button>
            </div>
          </div>

          {/* Layout Selection (only for labels) */}
          {mode === 'labels' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Label Layout</label>
              <div className="grid grid-cols-2 gap-3">
                {LABEL_LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      layout === l.id
                        ? 'border-[#f5576c] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-medium ${layout === l.id ? 'text-[#f5576c]' : 'text-gray-700'}`}>
                      {l.name}
                    </p>
                    <p className="text-xs text-gray-500">{l.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Include Description */}
          {mode !== 'zip' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDescription}
                onChange={(e) => setIncludeDescription(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#f5576c] focus:ring-[#f5576c]"
              />
              <span className="text-sm text-gray-700">Include descriptions</span>
            </label>
          )}

          {/* Info */}
          {mode === 'labels' && selectedLayout && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <strong>{selectedLayout.labelsPerPage}</strong> labels per page
                {qrCodes.length > selectedLayout.labelsPerPage && (
                  <span> ({Math.ceil(qrCodes.length / selectedLayout.labelsPerPage)} pages total)</span>
                )}
              </p>
            </div>
          )}

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f5576c] to-[#f093fb] transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Generating QR {progress.current} of {progress.total}...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || qrCodes.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
