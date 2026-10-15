import React, { useEffect } from 'react';
import { X, Printer, ArrowLeft } from 'lucide-react';
import { ComparisonReport, DocumentFields } from '../types/document';

interface PrintChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ComparisonReport;
  docA: DocumentFields;
  docB: DocumentFields;
}

export const PrintChecklistModal: React.FC<PrintChecklistModalProps> = ({
  isOpen,
  onClose,
  report,
  docA,
  docB
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const service = report.serviceGuidance;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Top Bar (hidden during printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Document Consistency Report &amp; Verification Checklist
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to Paper / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 print:text-black overflow-y-auto max-h-[75vh] print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 print:text-black">
                  SevaSetu — Document Consistency Pre-Verification Report
                </h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 print:text-gray-600">
                  Explainable Discrepancy Detection &amp; Field Verification Record
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 rounded border border-slate-300 print:border-black">
                  REF: SS-AUDIT-{Math.floor(1000 + Math.random() * 9000)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 print:text-gray-500">
                  Evaluated: {report.evaluatedAt}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium bg-slate-50 p-2.5 rounded border border-slate-200 print:bg-white print:border-gray-400 gap-1">
              <span><strong>Service Context:</strong> {service.name} ({service.portalDomain})</span>
              <span>
                <strong>Findings:</strong> {report.statusCounts.match} Match | {report.statusCounts.review} Review | {report.statusCounts.mismatch} Mismatch | {report.statusCounts.notAvailable} Not Available
              </span>
            </div>
          </div>

          {/* Document Summary Matrix */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 print:text-black">
              1. Document Identification Overview
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 print:bg-white">
                <p className="font-bold text-slate-900">Document A</p>
                <p className="text-slate-600">Category: <span className="font-semibold text-slate-900">{docA.documentType.toUpperCase()}</span></p>
                <p className="text-slate-600">Name: <span className="font-semibold text-slate-900">{docA.name || '—'}</span></p>
                <p className="text-slate-600">DOB: <span className="font-semibold text-slate-900">{docA.dob || '—'}</span></p>
                <p className="text-slate-600 truncate">Address: {docA.address || '—'}</p>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 print:bg-white">
                <p className="font-bold text-slate-900">Document B</p>
                <p className="text-slate-600">Category: <span className="font-semibold text-slate-900">{docB.documentType.toUpperCase()}</span></p>
                <p className="text-slate-600">Name: <span className="font-semibold text-slate-900">{docB.name || '—'}</span></p>
                <p className="text-slate-600">DOB: <span className="font-semibold text-slate-900">{docB.dob || '—'}</span></p>
                <p className="text-slate-600 truncate">Address: {docB.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Cross-Verification Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 print:text-black">
              2. Field Comparison Audit Matrix
            </h2>
            <table className="w-full text-left text-xs border border-slate-200 border-collapse print:border-black">
              <thead>
                <tr className="bg-slate-100 print:bg-gray-100 text-slate-800 border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">Field</th>
                  <th className="p-2 border-r border-slate-200">Document A Value</th>
                  <th className="p-2 border-r border-slate-200">Document B Value</th>
                  <th className="p-2 border-r border-slate-200">Status &amp; Rule</th>
                  <th className="p-2">Explanation &amp; Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                {Object.values(report.fieldResults).map((field) => (
                  <tr key={field.fieldName}>
                    <td className="p-2 font-semibold border-r border-slate-200 align-top">{field.label}</td>
                    <td className="p-2 font-mono border-r border-slate-200 align-top">{field.originalValA || '—'}</td>
                    <td className="p-2 font-mono border-r border-slate-200 align-top">{field.originalValB || '—'}</td>
                    <td className="p-2 font-bold uppercase border-r border-slate-200 align-top">
                      <div>{field.status.replace('_', ' ')}</div>
                      <div className="font-mono text-[10px] text-slate-500 font-normal">{field.ruleId}</div>
                    </td>
                    <td className="p-2 text-slate-700 align-top">
                      <p>{field.explanation}</p>
                      <p className="text-slate-500 italic mt-0.5">{field.suggestedVerification}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Findings-Driven Verification Checklist */}
          {report.checklist.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 print:text-black">
                3. Verification Action Items
              </h2>
              <div className="space-y-2 text-xs">
                {report.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 p-2 rounded border border-slate-200 print:border-gray-400">
                    <div className="w-4 h-4 border-2 border-slate-400 rounded-sm mt-0.5 shrink-0 print:border-black" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">
                        {item.field} — {item.issue}
                      </p>
                      <p className="text-slate-600 mt-0.5">{item.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Reference & Statutory Notice */}
          <div className="pt-4 border-t border-slate-300 text-xs text-slate-500 space-y-2 print:text-gray-600">
            <p>
              <strong>Verified Guidance Source:</strong> {service.name} ({service.verifiedOfficialSourceUrl}) — Checked {service.lastVerifiedDate}.
            </p>
            <p className="text-[10px] leading-relaxed">
              <strong>Limitation of Scope:</strong> {report.limitationsNotice} This report is an informational consistency checklist generated by deterministic text comparison. It does not certify individual identity, grant statutory clearance, or guarantee that an application will be accepted.
            </p>
          </div>
        </div>

        {/* Modal Bottom Action Bar (hidden in print) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Verify all discrepancies with the respective issuing authority before attending appointment.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Close Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
