import React, { useEffect } from 'react';
import { X, BookOpen, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

interface CivicHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CivicHelpModal: React.FC<CivicHelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Civic Document Verification Guide</h3>
              <p className="text-xs text-slate-300">Official rules and standard procedures for handling discrepancies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Question 1: Initials vs Full Name */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">1</span>
              Initials vs Expanded Names across Portals
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              In several regions across India, patronymics or ancestral place names are frequently abbreviated as initials on identity cards.
              Different public departments handle initials differently:
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>• <strong>Passport Seva (MEA):</strong> Official rules require the applicant&apos;s name to be written in full without single-letter abbreviations.</p>
              <p>• <strong>Income Tax / PAN:</strong> PAN databases historically accepted initials; however, online PAN-Aadhaar linking compares names against the UIDAI record and may flag differences.</p>
              <p>• <strong>Verification Step:</strong> Refer to the specific portal instructions before submitting, and verify if your educational certificate (10th marksheet) displays the expanded name.</p>
            </div>
          </div>

          {/* Question 2: Year of Birth Only Records */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">2</span>
              Records with Only Year of Birth (e.g., &ldquo;1985&rdquo;)
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Certain earlier enrollments or identity cards record only the birth year rather than a complete date.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>• <strong>Electoral Roll (ECI):</strong> Often accepts year-of-birth for establishing the qualifying voting age (18+).</p>
              <p>• <strong>Passport &amp; EPFO:</strong> Require an exact day, month, and year backed by an approved birth certificate or school leaving certificate.</p>
              <p>• <strong>Updating DOB in Aadhaar:</strong> UIDAI allows date of birth updates subject to official UIDAI documentation guidelines via an authorized Aadhaar Seva Kendra.</p>
            </div>
          </div>

          {/* Question 3: Resolving Name Discrepancies */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">3</span>
              How Discrepancies are Resolved Officially
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              When spelling or name variations exist between records, government departments typically prescribe specific statutory documentation:
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>• <strong>Minor typographical errors:</strong> Can often be corrected directly through online self-service portals (e.g. UIDAI Self-Service Update Portal, ECI Form 8, or NSDL/UTIITSL PAN correction).</p>
              <p>• <strong>Major changes:</strong> Many services may require a sworn affidavit or a Gazette notification depending on the department&apos;s specific rules.</p>
              <p>• <strong>Always verify:</strong> Consult the official portal FAQ before commissioning affidavits or paying legal stamp fees.</p>
            </div>
          </div>

          {/* Official Portals List */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Verified Official Reference Portals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="https://www.passportindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between text-blue-700"
              >
                <span>Passport Seva Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://myaadhaar.uidai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between text-blue-700"
              >
                <span>UIDAI myAadhaar Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://eportal.incometax.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between text-blue-700"
              >
                <span>Income Tax e-Filing (PAN)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://unifiedportal-mem.epfindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between text-blue-700"
              >
                <span>EPFO Member Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
