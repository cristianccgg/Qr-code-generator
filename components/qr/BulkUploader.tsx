'use client';

import { useState, useCallback } from 'react';
import { FiUpload, FiDownload, FiX, FiPlay, FiAlertCircle, FiLock } from 'react-icons/fi';
import { parseCSV, getValidItems, ParseCSVResult } from '@/lib/csv-parser';
import { downloadCSVTemplate } from '@/lib/csv-template';
import { BulkState, BulkProgress, BulkCreateResponse, ParsedCSVRow, BULK_LIMITS } from '@/types/bulk';
import BulkPreviewTable from './BulkPreviewTable';
import BulkProgressBar from './BulkProgressBar';
import BulkResultsSummary from './BulkResultsSummary';
import JSZip from 'jszip';
import { useSubscription } from '@/hooks/useSubscription';
import { useUpgradeModal } from '@/components/billing/UpgradeModal';

export default function BulkUploader() {
  const { canUseBulkCreation, loading: subscriptionLoading } = useSubscription();
  const { showUpgradeModal } = useUpgradeModal();
  const [state, setState] = useState<BulkState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseCSVResult | null>(null);
  const [progress, setProgress] = useState<BulkProgress>({ current: 0, total: 0 });
  const [results, setResults] = useState<BulkCreateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle file selection
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setState('parsing');

    try {
      const result = await parseCSV(selectedFile);
      setParseResult(result);

      if (!result.success) {
        setError(result.error || 'Failed to parse CSV');
        setState('error');
      } else {
        setState('preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      setState('error');
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setFile(null);
    setParseResult(null);
    setProgress({ current: 0, total: 0 });
    setResults(null);
    setError(null);
    setState('idle');
  }, []);

  // Start bulk creation
  const handleCreate = useCallback(async () => {
    if (!parseResult) return;

    const validItems = getValidItems(parseResult.rows);
    if (validItems.length === 0) {
      setError('No valid items to create');
      return;
    }

    setState('generating');
    setProgress({ current: 0, total: validItems.length });

    try {
      const response = await fetch('/api/qr/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems,
          skipInvalid: true,
        }),
      });

      const data: BulkCreateResponse = await response.json();

      // Simulate progress for better UX
      for (let i = 0; i <= data.totalCreated; i++) {
        setProgress({
          current: i,
          total: validItems.length,
          currentItem: validItems[i]?.description || validItems[i]?.content,
        });
        await new Promise(r => setTimeout(r, 50));
      }

      setResults(data);
      setState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR codes');
      setState('error');
    }
  }, [parseResult]);

  // Download ZIP with QR images
  const handleDownloadZip = useCallback(async () => {
    if (!results || results.created.length === 0) return;

    setIsDownloading(true);

    try {
      const { generateQRCode } = await import('@/lib/qr-generator');
      const zip = new JSZip();
      const folder = zip.folder('qr-codes');

      for (let i = 0; i < results.created.length; i++) {
        const qr = results.created[i];

        // Generate QR image
        const qrDataUrl = await generateQRCode({
          content: qr.shortUrl,
          color: '#000000',
          backgroundColor: '#FFFFFF',
          size: 512,
        });

        // Extract base64 from data URL
        const base64 = qrDataUrl.split(',')[1];
        const filename = qr.description
          ? `${qr.description.replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}.png`
          : `qr_${i + 1}.png`;

        folder?.file(filename, base64, { base64: true });
      }

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      setError('Failed to generate ZIP file');
    } finally {
      setIsDownloading(false);
    }
  }, [results]);

  // Si está cargando la subscripción, mostrar loading
  if (subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f5576c]/30 border-t-[#f5576c] mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Si no tiene acceso a bulk creation, mostrar upgrade prompt
  if (!canUseBulkCreation()) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiLock className="text-white text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Creation is a Pro Feature</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Create hundreds of QR codes at once from a CSV file. Upgrade to Pro to unlock this powerful feature.
        </p>
        <button
          onClick={() => showUpgradeModal('Bulk QR Creation', 'pro')}
          className="px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <FiAlertCircle className="text-xl flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Idle State: Upload Zone */}
      {state === 'idle' && (
        <div className="space-y-4">
          {/* Download Template Button */}
          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiDownload />
            Download CSV Template
          </button>

          {/* Upload Zone */}
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#f5576c] hover:bg-pink-50/30 transition-all cursor-pointer group"
          >
            <FiUpload className="w-10 h-10 text-gray-400 group-hover:text-[#f5576c] transition-colors mb-3" />
            <p className="text-gray-600 group-hover:text-gray-900 font-medium">
              Drag & drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Max {BULK_LIMITS.maxItems} rows, {BULK_LIMITS.maxFileSize / 1024}KB
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Parsing State */}
      {state === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f5576c]/30 border-t-[#f5576c] mb-4" />
          <p className="text-gray-600">Parsing CSV file...</p>
        </div>
      )}

      {/* Preview State */}
      {state === 'preview' && parseResult && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-lg flex items-center justify-center">
                <FiUpload className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{file?.name}</p>
                <p className="text-sm text-gray-500">
                  {parseResult.validCount} valid, {parseResult.invalidCount} errors
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Preview Table */}
          <BulkPreviewTable rows={parseResult.rows} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={parseResult.validCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlay className="text-lg" />
              Create {parseResult.validCount} QR Codes
            </button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {state === 'generating' && (
        <div className="py-8">
          <BulkProgressBar progress={progress} />
        </div>
      )}

      {/* Complete State */}
      {state === 'complete' && results && (
        <div className="space-y-6">
          <BulkResultsSummary
            results={results}
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Create More QR Codes
          </button>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="text-center py-8">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
