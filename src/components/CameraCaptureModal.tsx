import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  documentTitle: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  documentTitle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [enhanceContrast, setEnhanceContrast] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      return;
    }

    startCamera();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stopCamera();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      setErrorMessage('Camera access was denied or no camera device was detected. Please check permissions or use file upload.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply filters if enabled
    let filterString = '';
    if (enhanceContrast) filterString += 'contrast(1.25) brightness(1.05) ';
    if (grayscale) filterString += 'grayscale(1) ';
    ctx.filter = filterString.trim() || 'none';

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(base64);
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Live Document Scanner — {documentTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Hold your physical card flat inside the guide frame
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Captured document snapshot"
              className="w-full h-full object-contain"
            />
          ) : hasPermission === false ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-rose-300">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Card Framing Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-[85%] max-w-[440px] aspect-[1.586] border-2 border-amber-400/80 rounded-xl relative shadow-lg">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400" />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-wider text-amber-300 drop-shadow-md">
                    Align Indian ID Card Edges
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Filters & Capture Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Enhancement Toggles */}
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enhanceContrast}
                onChange={(e) => setEnhanceContrast(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span>High Contrast OCR</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span>B&amp;W Mode</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {capturedPreview ? (
              <>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Use This Scan</span>
                </button>
              </>
            ) : (
              <button
                disabled={hasPermission !== true}
                onClick={takeSnapshot}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Document</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
