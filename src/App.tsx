/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  RotateCcw,
  BookOpen,
  Printer,
  ShieldAlert,
  Info
} from 'lucide-react';
import { DocumentFields, ComparisonReport, DocumentType } from './types/document';
import { generateComparisonReport, OFFICIAL_SERVICE_GUIDELINES } from './utils/comparator';
import { SYNTHETIC_TEST_CASES, SyntheticTestCase } from './data/syntheticPresets';
import { Navbar } from './components/Navbar';
import { DocumentCard } from './components/DocumentCard';
import { ComparisonView } from './components/ComparisonView';
import { PrintChecklistModal } from './components/PrintChecklistModal';
import { CivicHelpModal } from './components/CivicHelpModal';
import { SampleCasePickerModal } from './components/SampleCasePickerModal';

const createEmptyDocument = (type: DocumentType): DocumentFields => ({
  documentType: type,
  documentNumber: '',
  name: '',
  fatherOrSpouseName: '',
  dob: '',
  gender: '',
  address: '',
  pincode: '',
  extractionConfidence: null,
  fieldMeta: {}
});

export default function App() {
  // Start with empty document inputs as mandated by guidelines
  const [docA, setDocA] = useState<DocumentFields>(() => createEmptyDocument('aadhaar'));
  const [docB, setDocB] = useState<DocumentFields>(() => createEmptyDocument('pan'));
  const [selectedServiceId, setSelectedServiceId] = useState<string>('general_review');

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSamplePickerOpen, setIsSamplePickerOpen] = useState(false);

  // Active loaded sample case title if user opted to try one
  const [activeSampleTitle, setActiveSampleTitle] = useState<string | null>(null);

  // Deterministic comparison logic runs whenever docA, docB, or selectedServiceId changes
  const report: ComparisonReport = useMemo(() => {
    return generateComparisonReport(docA, docB, selectedServiceId);
  }, [docA, docB, selectedServiceId]);

  const handleSelectTestCase = (testCase: SyntheticTestCase) => {
    setDocA(testCase.docA);
    setDocB(testCase.docB);
    setSelectedServiceId(testCase.recommendedService);
    setActiveSampleTitle(testCase.title);
  };

  const handleResetAll = () => {
    setDocA(createEmptyDocument('aadhaar'));
    setDocB(createEmptyDocument('pan'));
    setSelectedServiceId('general_review');
    setActiveSampleTitle(null);
  };

  const handleSwapDocuments = () => {
    const temp = { ...docA };
    setDocA({ ...docB });
    setDocB(temp);
  };

  const hasAnyInput = Boolean(
    docA.name || docA.dob || docA.address || docB.name || docB.dob || docB.address || docA.imageUri || docB.imageUri
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        onReset={handleResetAll}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSelectSample={() => setIsSamplePickerOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Purpose & Product Scope Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              <Info className="w-3.5 h-3.5 text-slate-600" />
              <span>Explainable Document Consistency Checker</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              Compare Two Documents &amp; Identify Discrepancies
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Compare name spellings, dates of birth, and addresses between Document A and Document B to detect inconsistencies and review OCR extractions before visiting public service centers.
            </p>

            {/* Scope Limitation Notice */}
            <div className="pt-2 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Scope Limitation:</strong> SevaSetu is an explainable consistency checker. It is not an identity-authentication service, legal adviser, government portal, eligibility checker, or rejection predictor. It does not certify official document validity or guarantee application acceptance.
              </p>
            </div>

            {/* Explicit Sample Case Trigger Bar */}
            <div className="pt-1 flex items-center gap-3 flex-wrap text-xs">
              <span className="font-semibold text-slate-600">Testing this tool?</span>
              <button
                onClick={() => setIsSamplePickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Try a Sample Case</span>
              </button>
              {activeSampleTitle && (
                <span className="text-xs text-slate-500">
                  Active Sample: <strong className="text-slate-800">{activeSampleTitle}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Neutral Document Inputs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Provide Documents to Compare
              </h2>
              <p className="text-xs text-slate-500">
                Upload image files (JPG, PNG), capture live with camera, or enter values manually. Extracted values remain fully editable.
              </p>
            </div>

            <button
              onClick={handleSwapDocuments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              title="Swap Document A and Document B values"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Swap Document A &amp; B</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentCard
              id="docA"
              title="Document A"
              data={docA}
              onChange={setDocA}
              accentColor="blue"
            />

            <DocumentCard
              id="docB"
              title="Document B"
              data={docB}
              onChange={setDocB}
              accentColor="indigo"
            />
          </div>
        </div>

        {/* Section 2: Comparison Findings & Transparent Statuses */}
        {hasAnyInput ? (
          <div className="pt-2">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                2. Consistency Findings &amp; Rule Explanations
              </h2>
              <p className="text-xs text-slate-500">
                Evaluated against deterministic matching rules. Original text is preserved; normalized copies are used for comparison.
              </p>
            </div>

            <ComparisonView
              report={report}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              docA={docA}
              docB={docB}
              docAName={docA.documentType.toUpperCase()}
              docBName={docB.documentType.toUpperCase()}
            />
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">Ready to Compare Documents</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload documents or enter information in Document A and Document B above to view side-by-side consistency findings, or choose &ldquo;Try a Sample Case&rdquo; to test with synthetic records.
            </p>
            <button
              onClick={() => setIsSamplePickerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Synthetic Sample Cases</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              SevaSetu
            </span>
            <span>•</span>
            <span>Explainable Document Consistency Prototype</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            Pre-verification utility. Official decisions are made exclusively by government issuing authorities.
          </div>
        </div>
      </footer>

      {/* Printable Report Modal */}
      <PrintChecklistModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={report}
        docA={docA}
        docB={docB}
      />

      {/* Civic Help Guide Modal */}
      <CivicHelpModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Sample Case Picker Modal */}
      <SampleCasePickerModal
        isOpen={isSamplePickerOpen}
        onClose={() => setIsSamplePickerOpen(false)}
        onSelectCase={handleSelectTestCase}
      />
    </div>
  );
}
