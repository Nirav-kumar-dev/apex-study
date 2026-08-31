import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { loadPdfFromStorage } from '../../lib/pdfStorage';

// Configure legacy worker for Android WebView compatibility
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
} catch {
  // If URL resolution fails, legacy build will use built-in main-thread renderer
}

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onAskAiAboutPage?: (pageText: string, pageNum: number) => void;
  onPageTextExtracted?: (text: string, pageNum: number, totalPages: number) => void;
  onPickDeviceFolder?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  title,
  className = '',
  isMaximized = false,
  onToggleMaximize,
  onAskAiAboutPage,
  onPageTextExtracted,
  onPickDeviceFolder,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [pageTheme, setPageTheme] = useState<'normal' | 'dark' | 'sepia'>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>('Loading document...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>('1');
  const [useNativeViewerFallback, setUseNativeViewerFallback] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document with multi-strategy fetching
  useEffect(() => {
    let isCancelled = false;
    setUseNativeViewerFallback(false);

    if (!pdfUrl || !pdfUrl.trim()) {
      setErrorMsg('No PDF document URL provided.');
      setIsLoading(false);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setLoadingProgress('Opening textbook document...');
      setPdfDoc(null);
      setCurrentPage(1);
      setPageInput('1');

      try {
        let pdfData: Uint8Array | null = null;
        const cleanUrl = pdfUrl.trim();

        // Strategy 0: Permanent IndexedDB Offline Document
        if (cleanUrl.startsWith('idb://')) {
          try {
            pdfData = await loadPdfFromStorage(cleanUrl);
          } catch (e) {
            console.warn('IndexedDB PDF load failed:', e);
          }
        }

        // Strategy A: Direct blob: or data: or http/https URLs
        if (!pdfData && (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:'))) {
          try {
            const res = await fetch(cleanUrl);
            if (res.ok) {
              const buf = await res.arrayBuffer();
              pdfData = new Uint8Array(buf);
            }
          } catch (e) {
            console.warn('Blob fetch failed:', e);
          }
        }

        // Strategy B: Array of path variations for Android Capacitor assets & Web Vite
        if (!pdfData) {
          const stripped = cleanUrl.replace(/^\/+/, '');
          const unencoded = decodeURI(stripped);
          const encoded = encodeURI(unencoded);

          const candidatePaths = [
            cleanUrl,
            stripped,
            `/${stripped}`,
            `./${stripped}`,
            encoded,
            `/${encoded}`,
            `./${encoded}`,
            unencoded,
            `/${unencoded}`,
            `./${unencoded}`,
            typeof window !== 'undefined' ? `${window.location.origin}/${stripped}` : '',
            typeof window !== 'undefined' ? `${window.location.origin}/${encoded}` : '',
          ].filter(Boolean);

          for (const path of candidatePaths) {
            try {
              const res = await fetch(path);
              if (res.ok) {
                const buf = await res.arrayBuffer();
                if (buf.byteLength > 100) {
                  pdfData = new Uint8Array(buf);
                  break;
                }
              }
            } catch {}
          }
        }

        if (isCancelled) return;

        setLoadingProgress('Rendering vector page layouts...');

        // Pass ArrayBuffer data or URL directly to PDF.js
        const loadingTask = pdfjsLib.getDocument(
          pdfData
            ? {
                data: pdfData,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                disableRange: true,
                disableStream: true,
                disableAutoFetch: true,
              }
            : {
                url: cleanUrl,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
              }
        );

        loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
          if (progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setLoadingProgress(`Loading PDF pages (${percent}%)...`);
          }
        };

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn('PDF.js rendering error:', err);
        setErrorMsg(`Unable to display PDF (${err?.message || 'File not found'}). You can choose a folder from your device.`);
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfUrl]);

  // Render Current Page on Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Cancel previous active render task
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const viewport = page.getViewport({ scale: zoomScale, rotation });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        // Auto-extract text for NVIDIA NIM AI Study Tutor
        try {
          const textContent = await page.getTextContent();
          const pText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          if (onPageTextExtracted && pText) {
            onPageTextExtracted(pText, pageNumber, pdfDoc.numPages);
          }
        } catch (textErr) {
          console.warn('Live page text extraction warning:', textErr);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('PDF page render error:', err);
        }
      }
    },
    [pdfDoc, zoomScale, rotation, onPageTextExtracted]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoomScale, rotation, renderPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setPageInput(String(prev));
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomScale(1.2);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Extract text from current page for AI Tutor
  const handleExtractPageTextForAi = async () => {
    if (!pdfDoc || !onAskAiAboutPage) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .slice(0, 1500);
      onAskAiAboutPage(pageText, currentPage);
    } catch (err) {
      console.warn('Failed to extract page text:', err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

  // CSS Filter for Page Theme (Dark mode / Invert / Sepia)
  const getThemeFilterStyle = () => {
    if (pageTheme === 'dark') {
      return 'invert(90%) hue-rotate(180deg) contrast(95%) brightness(95%)';
    }
    if (pageTheme === 'sepia') {
      return 'sepia(35%) contrast(95%) brightness(95%)';
    }
    return 'none';
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all duration-200 ${className}`}
    >
      {/* Top PDF Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-850 border-b border-slate-800 text-xs select-none">
        {/* Left: Page navigation & AI Explain */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 border border-slate-750 rounded-xl p-0.5 shadow-inner">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              title="Previous Page (Left Arrow)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Input Box */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                disabled={isLoading || numPages === 0}
                className="w-10 text-center font-mono font-bold bg-slate-800 border border-slate-700 rounded-lg text-indigo-300 text-xs py-0.5 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 font-mono text-xs ml-1 mr-0.5">
                / {numPages || 1}
              </span>
            </form>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages || isLoading}
              title="Next Page (Right Arrow)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ask AI about this page button */}
          {onAskAiAboutPage && !isLoading && (
            <button
              type="button"
              onClick={handleExtractPageTextForAi}
              title="Explain this page with NVIDIA AI Tutor"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/25 to-cyan-600/25 border border-indigo-500/40 text-indigo-200 hover:text-white hover:border-indigo-400 flex items-center gap-1.5 font-bold transition-all cursor-pointer text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Explain Page</span>
            </button>
          )}
        </div>

        {/* Right: Zoom, Rotation, Color Theme, Select Folder & Fullscreen */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Select Folder Button */}
          {onPickDeviceFolder && (
            <button
              type="button"
              onClick={onPickDeviceFolder}
              title="Select folder or PDF files from device"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 text-xs shadow cursor-pointer transition-all active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Select Folder</span>
            </button>
          )}

          {/* Zoom Toolbar */}
          <div className="flex items-center bg-slate-900 border border-slate-750 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 0.5 || isLoading}
              title="Zoom Out"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="px-1.5 text-[11px] font-mono font-bold text-indigo-300 hover:text-white cursor-pointer"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 3.0 || isLoading}
              title="Zoom In"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate */}
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Page Theme Filter (Normal / Dark / Sepia) */}
          <div className="flex items-center bg-slate-900 border border-slate-750 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setPageTheme('normal')}
              title="Normal White Mode"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                pageTheme === 'normal'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPageTheme('dark')}
              title="Inverted Dark Mode (Comfortable for night studying)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                pageTheme === 'dark'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPageTheme('sepia')}
              title="Warm Sepia Mode"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                pageTheme === 'sepia'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Maximize Toggle */}
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              title={isMaximized ? 'Exit Full Reader' : 'Expand Full Reader'}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* External Tab / Download Link */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              title="Download or Open in External App"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Canvas Document Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[460px] bg-slate-950/80 custom-scrollbar relative">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-300">{loadingProgress}</p>
            <p className="text-[10px] text-slate-500">
              Rendering textbook pages directly on device canvas
            </p>
          </div>
        )}

        {/* Error Fallback with Folder Selector */}
        {errorMsg && !isLoading && !useNativeViewerFallback && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Select Textbook Folder</h4>
            <p className="text-xs text-slate-400">{errorMsg}</p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onPickDeviceFolder && (
                <button
                  type="button"
                  onClick={onPickDeviceFolder}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow cursor-pointer active:scale-95"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose Folder from Phone</span>
                </button>
              )}

              {pdfUrl && (
                <button
                  type="button"
                  onClick={() => setUseNativeViewerFallback(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Try Native View</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Native Viewer Fallback */}
        {useNativeViewerFallback && !isLoading && (
          <div className="w-full h-full min-h-[500px] flex flex-col rounded-xl overflow-hidden">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full min-h-[500px] rounded-xl border-0"
            >
              <div className="p-8 text-center text-slate-300">
                <p>Native viewer opened. You can also download or view via external app:</p>
                <a
                  href={pdfUrl}
                  download
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
            </object>
          </div>
        )}

        {/* Single Page Canvas Display */}
        {!isLoading && !errorMsg && !useNativeViewerFallback && (
          <div
            className="flex items-center justify-center shadow-2xl rounded-xl overflow-hidden transition-all duration-150"
            style={{
              filter: getThemeFilterStyle(),
            }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-none rounded-lg bg-white shadow-2xl select-text"
            />
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          <span className="truncate font-mono">{title || 'NCERT Textbook Chapter'}</span>
        </div>
        <div className="flex items-center gap-3 font-mono flex-shrink-0">
          <span>
            Page {currentPage} of {numPages}
          </span>
          <span>•</span>
          <span className="text-indigo-400 font-bold">{Math.round(zoomScale * 100)}% Zoom</span>
        </div>
      </div>
    </div>
  );
};
