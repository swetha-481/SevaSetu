/**
 * SevaSetu - Type Definitions
 * Explainable Document Consistency Checker
 */

export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'voter_id'
  | 'passport'
  | 'driving_license'
  | 'marksheet'
  | 'ration_card'
  | 'other';

export type ValueSource = 'extracted' | 'user_edited' | 'manual' | 'preset';

export interface DocumentFieldMeta {
  source: ValueSource;
  isConfirmed?: boolean;
}

export interface DocumentFields {
  documentType: DocumentType;
  customTypeLabel?: string;
  documentNumber: string;
  name: string;
  fatherOrSpouseName: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  extractionConfidence?: number | null;
  fieldMeta?: Partial<Record<string, DocumentFieldMeta>>;
  imageUri?: string;
}

export type FieldStatus = 'match' | 'review' | 'mismatch' | 'not_available';

export interface FieldComparisonResult {
  fieldName: string;
  label: string;
  hindiLabel: string;
  originalValA: string;
  originalValB: string;
  normalizedValA: string;
  normalizedValB: string;
  status: FieldStatus;
  ruleId: string;
  ruleDescription: string;
  explanation: string;
  suggestedVerification: string;
  differences?: {
    added: string[];
    removed: string[];
    common: string[];
  };
}

export interface VerificationChecklistItem {
  id: string;
  field: string;
  status: FieldStatus;
  issue: string;
  suggestedAction: string;
  sourceReference?: string;
  isCompleted?: boolean;
}

export interface OfficialServiceGuidance {
  id: string;
  name: string;
  hindiName: string;
  portalDomain: string;
  verifiedOfficialSourceUrl: string;
  lastVerifiedDate: string;
  officialNote: string;
  primaryIdentityRule: string;
}

export interface ComparisonReport {
  statusCounts: {
    match: number;
    review: number;
    mismatch: number;
    notAvailable: number;
  };
  totalFieldsCompared: number;
  summaryText: string;
  fieldResults: {
    name: FieldComparisonResult;
    dob: FieldComparisonResult;
    address: FieldComparisonResult;
    fatherOrSpouseName: FieldComparisonResult;
    pincode: FieldComparisonResult;
    gender: FieldComparisonResult;
  };
  checklist: VerificationChecklistItem[];
  serviceGuidance: OfficialServiceGuidance;
  evaluatedAt: string;
  limitationsNotice: string;
}
