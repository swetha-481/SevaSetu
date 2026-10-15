import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Printer,
  Building2,
  FileCheck2,
  ExternalLink,
  Info,
  Calendar,
  User,
  MapPin,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  ComparisonReport,
  FieldComparisonResult,
  FieldStatus,
  DocumentFields
} from '../types/document';
import { OFFICIAL_SERVICE_GUIDELINES } from '../utils/comparator';
import { VisualDiffInspector } from './VisualDiffInspector';

interface ComparisonViewProps {
  report: ComparisonReport;
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onOpenPrintModal: () => void;
  docA: DocumentFields;
  docB: DocumentFields;
  docAName: string;
  docBName: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  report,
  selectedServiceId,
  onSelectService,
  onOpenPrintModal,
  docA,
  docB,
  docAName,
  docBName
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getStatusBadge = (status: FieldStatus) => {
    switch (status) {
      case 'match':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Match
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Review Needed
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Mismatch
          </span>
        );
      case 'not_available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Not Available
          </span>
        );
    }
  };

  const activeGuidance = report.serviceGuidance;

  return (
    <div className="space-y-6">
      {/* Transparent Status Summary Card (NO unvalidated percentages or rejection predictions) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                Consistency Summary
              </span>
              <span className="text-xs text-slate-400">
                6 Identity Fields Examined
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed max-w-2xl">
              {report.summaryText}
            </p>
          </div>

          {/* Transparent Status Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Match
              </span>
              <span className="text-xl font-bold font-mono text-emerald-900 mt-0.5">
                {report.statusCounts.match}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Review
              </span>
              <span className="text-xl font-bold font-mono text-amber-900 mt-0.5">
                {report.statusCounts.review}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Mismatch
              </span>
              <span className="text-xl font-bold font-mono text-rose-900 mt-0.5">
                {report.statusCounts.mismatch}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Not Available
              </span>
              <span className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                {report.statusCounts.notAvailable}
              </span>
            </div>
          </div>
        </div>

        {/* Target Public Service Context with verified official sources */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Service Context Reference
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => onSelectService(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                {OFFICIAL_SERVICE_GUIDELINES.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span>Verified Source:</span>
              <a
                href={activeGuidance.verifiedOfficialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                <span>{activeGuidance.portalDomain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
            <span>•</span>
            <span>Last checked: {activeGuidance.lastVerifiedDate}</span>
          </div>
        </div>

        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800 font-semibold">{activeGuidance.name}: </strong>
            {activeGuidance.officialNote}
          </p>
        </div>
      </div>

      {/* Sub-Character Visual Diff Inspector (for cardholder name comparison) */}
      {docA.name && docB.name && (
        <VisualDiffInspector
          nameA={docA.name}
          nameB={docB.name}
          docAName={docAName}
          docBName={docBName}
        />
      )}

      {/* Field-by-Field Detailed Comparison Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Field-by-Field Comparison Findings
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated using deterministic parsing and normalization rules.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.values(report.fieldResults).map((fieldRes) => (
            <FieldComparisonCard
              key={fieldRes.fieldName}
              result={fieldRes}
              docAName={docAName}
              docBName={docBName}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      </div>

      {/* Findings-Driven Action Checklist (only items arising from findings) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-slate-800" />
              <h3 className="text-base font-bold text-slate-900">
                Information Verification Checklist
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific discrepancies and missing fields to verify with the issuing authority before submitting an application.
            </p>
          </div>

          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Printable Report</span>
          </button>
        </div>

        {report.checklist.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-800">No discrepancies detected across the compared fields.</p>
            <p className="text-slate-400 mt-0.5">Always ensure you verify the specific checklist requirements of your service portal.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {report.checklist.map((item) => {
              const isDone = Boolean(completedTasks[item.id]);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleTask(item.id)}
                  className={`py-3 flex items-start gap-3 cursor-pointer group rounded-lg px-2 -mx-2 transition-colors ${
                    isDone ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleTask(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {item.field}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium leading-relaxed">
                      Issue: {item.issue}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                      <strong>Suggested Next Step:</strong> {item.suggestedAction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statutory & Limitations Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Product Scope &amp; Legal Limitation</p>
          <p className="text-slate-600 leading-relaxed">
            {report.limitationsNotice} This tool is intended solely to assist users in comparing document fields before visiting service centers.
            Official determinations of identity, document validity, and application acceptance rest solely with authorized government verification officers.
          </p>
        </div>
      </div>
    </div>
  );
};

interface FieldComparisonCardProps {
  result: FieldComparisonResult;
  docAName: string;
  docBName: string;
  getStatusBadge: (status: FieldStatus) => React.ReactNode;
}

const FieldComparisonCard: React.FC<FieldComparisonCardProps> = ({
  result,
  docAName,
  docBName,
  getStatusBadge
}) => {
  const getIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'name':
        return <User className="w-4 h-4 text-slate-700" />;
      case 'dob':
        return <Calendar className="w-4 h-4 text-slate-700" />;
      case 'address':
        return <MapPin className="w-4 h-4 text-slate-700" />;
      default:
        return <FileCheck2 className="w-4 h-4 text-slate-700" />;
    }
  };

  const getBorder = (status: FieldStatus) => {
    switch (status) {
      case 'match':
        return 'border-emerald-200 bg-white';
      case 'review':
        return 'border-amber-200 bg-amber-50/20';
      case 'mismatch':
        return 'border-rose-200 bg-rose-50/20';
      case 'not_available':
        return 'border-slate-200 bg-white';
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all shadow-xs ${getBorder(result.status)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            {getIcon(result.fieldName)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {result.label} <span className="font-hindi text-xs text-slate-500 font-normal">({result.hindiLabel})</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {getStatusBadge(result.status)}
          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {result.ruleId}
          </span>
        </div>
      </div>

      {/* Side-by-side original and normalized values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
        {/* Document A */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>DOCUMENT A: {docAName}</span>
            <span className="text-[10px] text-slate-400">Original Text</span>
          </div>
          <p className="text-sm font-medium text-slate-900 break-words font-mono">
            {result.originalValA || <span className="text-slate-400 italic">Not available</span>}
          </p>
          {result.normalizedValA && result.normalizedValA !== result.originalValA && (
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Normalized: <span className="font-mono text-slate-700">{result.normalizedValA}</span>
            </p>
          )}
        </div>

        {/* Document B */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>DOCUMENT B: {docBName}</span>
            <span className="text-[10px] text-slate-400">Original Text</span>
          </div>
          <p className="text-sm font-medium text-slate-900 break-words font-mono">
            {result.originalValB || <span className="text-slate-400 italic">Not available</span>}
          </p>
          {result.normalizedValB && result.normalizedValB !== result.originalValB && (
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Normalized: <span className="font-mono text-slate-700">{result.normalizedValB}</span>
            </p>
          )}
        </div>
      </div>

      {/* Rule explanation and suggested verification */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
        <p className="text-slate-700">
          <strong className="text-slate-900 font-semibold">Evaluation Rule ({result.ruleId}): </strong>
          {result.ruleDescription}
        </p>
        <p className="text-slate-600">
          <strong className="text-slate-800 font-semibold">Observation: </strong>
          {result.explanation}
        </p>
        <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
          <strong className="text-slate-900 font-semibold">Suggested Verification: </strong>
          {result.suggestedVerification}
        </p>
      </div>
    </div>
  );
};
