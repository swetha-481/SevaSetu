import React, { useRef, useState } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  Shield,
  Loader2,
  Camera,
  Check
} from 'lucide-react';
import { DocumentFields, DocumentType, DocumentFieldMeta } from '../types/document';
import { generateSyntheticCardSvg } from '../data/syntheticPresets';
import { CameraCaptureModal } from './CameraCaptureModal';

interface DocumentCardProps {
  id: 'docA' | 'docB';
  title: string;
  data: DocumentFields;
  onChange: (fields: DocumentFields) => void;
  accentColor: 'blue' | 'indigo';
}

const DOCUMENT_OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter_id', label: 'Voter ID (EPIC)' },
  { value: 'driving_license', label: 'Driving Licence' },
  { value: 'marksheet', label: '10th / Matriculation Marksheet' },
  { value: 'ration_card', label: 'Ration Card' },
  { value: 'other', label: 'Other Official ID' }
];

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  title,
  data,
  onChange,
  accentColor
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (key: keyof DocumentFields, value: any) => {
    const existingMeta = data.fieldMeta?.[key as string] || { source: 'manual' };
    const updatedMeta: DocumentFieldMeta = {
      ...existingMeta,
      source: existingMeta.source === 'extracted' ? 'user_edited' : 'manual',
      isConfirmed: false
    };

    onChange({
      ...data,
      [key]: value,
      fieldMeta: {
        ...(data.fieldMeta || {}),
        [key as string]: updatedMeta
      }
    });
  };

  const toggleFieldConfirmed = (key: string) => {
    const currentMeta = data.fieldMeta?.[key] || { source: 'manual' };
    onChange({
      ...data,
      fieldMeta: {
        ...(data.fieldMeta || {}),
        [key]: {
          ...currentMeta,
          isConfirmed: !currentMeta.isConfirmed
        }
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setExtractError('Please upload a valid JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setExtractError('File size exceeds 10MB limit. Please upload a smaller scan or photo.');
      return;
    }

    setExtractError(null);
    setExtractNotice(null);
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;

      onChange({
        ...data,
        imageUri: base64Data
      });

      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            documentTypeHint: data.documentType
          })
        });

        const result = await response.json();

        if (result.success && result.data) {
          const extracted = result.data;
          const newMeta: Record<string, DocumentFieldMeta> = {};

          if (extracted.name) newMeta.name = { source: 'extracted', isConfirmed: false };
          if (extracted.dob || extracted.dobFormatted) newMeta.dob = { source: 'extracted', isConfirmed: false };
          if (extracted.address) newMeta.address = { source: 'extracted', isConfirmed: false };
          if (extracted.pincode) newMeta.pincode = { source: 'extracted', isConfirmed: false };
          if (extracted.fatherOrSpouseName) newMeta.fatherOrSpouseName = { source: 'extracted', isConfirmed: false };
          if (extracted.gender) newMeta.gender = { source: 'extracted', isConfirmed: false };
          if (extracted.documentNumber) newMeta.documentNumber = { source: 'extracted', isConfirmed: false };

          onChange({
            ...data,
            name: extracted.name || data.name,
            dob: extracted.dobFormatted || extracted.dob || data.dob,
            address: extracted.address || data.address,
            pincode: extracted.pincode || data.pincode,
            fatherOrSpouseName: extracted.fatherOrSpouseName || data.fatherOrSpouseName,
            gender: extracted.gender || data.gender,
            documentNumber: extracted.documentNumber || data.documentNumber,
            extractionConfidence: typeof extracted.confidence === 'number' ? extracted.confidence : null,
            fieldMeta: {
              ...(data.fieldMeta || {}),
              ...newMeta
            },
            imageUri: base64Data
          });
          setExtractNotice('OCR completed. Please review and verify the extracted fields below before proceeding.');
        } else {
          setExtractError(result.error || 'OCR could not read document fields. Please enter details manually.');
        }
      } catch {
        setExtractError('Extraction service unavailable. Please enter fields manually below.');
      } finally {
        setIsExtracting(false);
      }
    };

    reader.onerror = () => {
      setExtractError('Could not read selected file.');
      setIsExtracting(false);
    };

    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async (base64Data: string) => {
    setExtractError(null);
    setExtractNotice(null);
    setIsExtracting(true);

    onChange({
      ...data,
      imageUri: base64Data
    });

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          documentTypeHint: data.documentType
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        const extracted = result.data;
        const newMeta: Record<string, DocumentFieldMeta> = {};

        if (extracted.name) newMeta.name = { source: 'extracted', isConfirmed: false };
        if (extracted.dob || extracted.dobFormatted) newMeta.dob = { source: 'extracted', isConfirmed: false };
        if (extracted.address) newMeta.address = { source: 'extracted', isConfirmed: false };
        if (extracted.pincode) newMeta.pincode = { source: 'extracted', isConfirmed: false };

        onChange({
          ...data,
          name: extracted.name || data.name,
          dob: extracted.dobFormatted || extracted.dob || data.dob,
          address: extracted.address || data.address,
          pincode: extracted.pincode || data.pincode,
          fatherOrSpouseName: extracted.fatherOrSpouseName || data.fatherOrSpouseName,
          gender: extracted.gender || data.gender,
          documentNumber: extracted.documentNumber || data.documentNumber,
          extractionConfidence: typeof extracted.confidence === 'number' ? extracted.confidence : null,
          fieldMeta: {
            ...(data.fieldMeta || {}),
            ...newMeta
          },
          imageUri: base64Data
        });
        setExtractNotice('Live scan fields extracted. Please review and confirm below.');
      } else {
        setExtractError(result.error || 'OCR could not extract fields. Manual entry is ready.');
      }
    } catch {
      setExtractError('Extraction service unavailable. Please enter details manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClearImage = () => {
    onChange({
      ...data,
      imageUri: undefined,
      extractionConfidence: null
    });
    setExtractNotice(null);
    setExtractError(null);
  };

  const handleClearFields = () => {
    onChange({
      documentType: data.documentType,
      documentNumber: '',
      name: '',
      fatherOrSpouseName: '',
      dob: '',
      gender: '',
      address: '',
      pincode: '',
      extractionConfidence: null,
      fieldMeta: {},
      imageUri: undefined
    });
    setExtractNotice(null);
    setExtractError(null);
  };

  const renderFieldBadge = (fieldKey: string, value: string) => {
    if (!value) {
      return (
        <span className="text-[10px] text-slate-400 font-normal">
          Missing / Blank
        </span>
      );
    }

    const meta = data.fieldMeta?.[fieldKey];
    const source = meta?.source || 'manual';
    const isConfirmed = Boolean(meta?.isConfirmed);

    return (
      <div className="flex items-center gap-1.5">
        {source === 'extracted' && (
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">
            OCR Extracted
          </span>
        )}
        {source === 'user_edited' && (
          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-medium">
            Edited
          </span>
        )}
        {source === 'manual' && (
          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium">
            Manual Entry
          </span>
        )}
        {source === 'preset' && (
          <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-medium">
            Sample Data
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFieldConfirmed(fieldKey)}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium transition-colors cursor-pointer ${
            isConfirmed
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200'
          }`}
          title="Mark field as verified by you"
        >
          <Check className="w-2.5 h-2.5" />
          <span>{isConfirmed ? 'Verified' : 'Confirm'}</span>
        </button>
      </div>
    );
  };

  const displayImageUri = data.imageUri || (data.name ? generateSyntheticCardSvg(data, title) : null);
  const themeBorder = accentColor === 'blue' ? 'border-blue-200' : 'border-indigo-200';
  const themeHeader = accentColor === 'blue' ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white';

  return (
    <div className={`bg-white rounded-2xl border ${themeBorder} shadow-xs overflow-hidden flex flex-col`}>
      {/* Card Header */}
      <div className={`px-5 py-3 ${themeHeader} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center font-bold text-xs border border-white/20">
            {id === 'docA' ? 'A' : 'B'}
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {data.extractionConfidence !== null && data.extractionConfidence !== undefined && (
            <span className="text-[11px] text-slate-300 font-mono">
              OCR Confidence: {Math.round(data.extractionConfidence * 100)}%
            </span>
          )}
          <button
            onClick={handleClearFields}
            className="text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Document Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Document Category
          </label>
          <select
            value={data.documentType}
            onChange={(e) => handleFieldChange('documentType', e.target.value as DocumentType)}
            className="w-full text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            {DOCUMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Upload / Scanner Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`relative rounded-xl border-2 border-dashed transition-all p-3.5 flex flex-col items-center justify-center text-center ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50'
              : displayImageUri
              ? 'border-slate-300 bg-slate-50/60'
              : 'border-slate-300 bg-slate-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          {isExtracting ? (
            <div className="py-6 flex flex-col items-center gap-2.5">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Reading text fields from image...</p>
              <p className="text-xs text-slate-500">Transcribing visible fields</p>
            </div>
          ) : displayImageUri ? (
            <div className="w-full relative">
              <div className="max-h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-950/5 flex items-center justify-center">
                <img
                  src={displayImageUri}
                  alt={`${title} Preview`}
                  className="object-contain max-h-40 w-auto rounded"
                />
              </div>

              {/* Actions on active image */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                >
                  <Eye className="w-3 h-3 text-slate-600" />
                  <span>Inspect</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-slate-600" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Remove Image</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 px-2 flex flex-col items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Upload or Scan Image
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  JPG, JPEG, PNG, WEBP (Max 10MB)
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Scan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informational Privacy notice */}
        <p className="text-[11px] text-slate-500 leading-normal">
          <span className="font-semibold text-slate-700">Notice:</span> Images are processed in memory and sent to the configured Vision OCR service for text extraction. No images are permanently stored on the server.
        </p>

        {/* Notices & Alerts */}
        {extractNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>{extractNotice}</div>
          </div>
        )}
        {extractError && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>{extractError}</div>
          </div>
        )}

        {/* Editable Fields Section */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              Editable Document Fields
            </span>
            <span className="text-[11px] text-slate-400">Review or correct any reading</span>
          </div>

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </span>
              {renderFieldBadge('name', data.name)}
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Full name as printed"
              className="w-full text-sm font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date of Birth
                </span>
                {renderFieldBadge('dob', data.dob)}
              </div>
              <input
                type="text"
                value={data.dob}
                onChange={(e) => handleFieldChange('dob', e.target.value)}
                placeholder="DD/MM/YYYY or YYYY"
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Gender</span>
                {renderFieldBadge('gender', data.gender)}
              </div>
              <select
                value={data.gender || ''}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Not Specified</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          {/* Father / Spouse Name */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Father / Spouse / Guardian Name</span>
              {renderFieldBadge('fatherOrSpouseName', data.fatherOrSpouseName)}
            </div>
            <input
              type="text"
              value={data.fatherOrSpouseName}
              onChange={(e) => handleFieldChange('fatherOrSpouseName', e.target.value)}
              placeholder="Guardian name if recorded"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Residential Address
              </span>
              {renderFieldBadge('address', data.address)}
            </div>
            <textarea
              rows={2}
              value={data.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              placeholder="Address as recorded (leave blank if not printed on ID)"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* PIN Code & Document Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>PIN Code</span>
                {renderFieldBadge('pincode', data.pincode)}
              </div>
              <input
                type="text"
                maxLength={6}
                value={data.pincode}
                onChange={(e) => handleFieldChange('pincode', e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN"
                className="w-full text-sm font-mono font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Document Number</span>
                {renderFieldBadge('documentNumber', data.documentNumber)}
              </div>
              <input
                type="text"
                value={data.documentNumber}
                onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                placeholder="e.g. XXXX-XXXX-4921"
                className="w-full text-sm font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for full image view */}
      {showPreviewModal && displayImageUri && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 overflow-hidden relative shadow-2xl cursor-default flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {title} — Image Inspection
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            <div className="py-4 flex justify-center bg-slate-950 rounded-lg my-3">
              <img
                src={displayImageUri}
                alt="Enlarged document preview"
                className="max-h-[60vh] w-auto object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Verify that card text matches the entered fields above.
              </p>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        documentTitle={title}
      />
    </div>
  );
};
