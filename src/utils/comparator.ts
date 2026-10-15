/**
 * SevaSetu - Deterministic Document Consistency Comparator
 * Pure deterministic logic for comparing textual records between two documents.
 * Does not calculate unvalidated readiness percentages or predict government rejections.
 */

import {
  DocumentFields,
  FieldComparisonResult,
  ComparisonReport,
  VerificationChecklistItem,
  OfficialServiceGuidance,
  FieldStatus
} from '../types/document';

// Verified Indian Public Service Guidance with verified official reference URLs and check dates
export const OFFICIAL_SERVICE_GUIDELINES: OfficialServiceGuidance[] = [
  {
    id: 'passport',
    name: 'Passport Seva (Ministry of External Affairs)',
    hindiName: 'पासपोर्ट सेवा केंद्र',
    portalDomain: 'passportindia.gov.in',
    verifiedOfficialSourceUrl: 'https://www.passportindia.gov.in/AppOnlineProject/online/faqServicesAvailable',
    lastVerifiedDate: 'October 2026',
    officialNote: 'Official Passport Seva guidelines specify that full names should be expanded without abbreviations/initials, and proof of date of birth requires exact day, month, and year.',
    primaryIdentityRule: 'Full expanded name and exact date of birth required.'
  },
  {
    id: 'pan_aadhaar',
    name: 'PAN-Aadhaar Seeding (Income Tax Department)',
    hindiName: 'पैन-आधार लिंकिंग',
    portalDomain: 'incometax.gov.in',
    verifiedOfficialSourceUrl: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/bl-link-aadhaar',
    lastVerifiedDate: 'October 2026',
    officialNote: 'Income Tax e-filing portal validates Name, Date of Birth, and Gender against the UIDAI database. Where minor demographic differences exist, biometric verification may be required.',
    primaryIdentityRule: 'Exact match on Name, DOB, and Gender.'
  },
  {
    id: 'epfo_kyc',
    name: 'EPFO UAN KYC & Claims (EPFO India)',
    hindiName: 'ईपीएफओ / पीएफ क्लेम',
    portalDomain: 'epfindia.gov.in',
    verifiedOfficialSourceUrl: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/',
    lastVerifiedDate: 'October 2026',
    officialNote: 'EPFO mandates Aadhaar seeding for online claim submissions. Discrepancies between establishment member profiles and Aadhaar records require an employer-attested joint declaration.',
    primaryIdentityRule: 'Aadhaar demographic seeding with establishment records.'
  },
  {
    id: 'driving_license',
    name: 'Driving Licence (Parivahan Sarathi)',
    hindiName: 'ड्राइविंग लाइसेंस (परिवहन)',
    portalDomain: 'sarathi.parivahan.gov.in',
    verifiedOfficialSourceUrl: 'https://sarathi.parivahan.gov.in/',
    lastVerifiedDate: 'October 2026',
    officialNote: 'State Transport Departments require valid proof of age and residential jurisdiction. Documents with differing residential addresses should be reviewed against current residence proofs.',
    primaryIdentityRule: 'Age proof and jurisdictional residential address.'
  },
  {
    id: 'voter_id',
    name: 'Voter Registration (Election Commission of India)',
    hindiName: 'मतदाता पहचान पत्र (ईसीआई)',
    portalDomain: 'voters.eci.gov.in',
    verifiedOfficialSourceUrl: 'https://voters.eci.gov.in/',
    lastVerifiedDate: 'October 2026',
    officialNote: 'ECI electoral rolls prioritize qualifying age (18+) and ordinary residence within the assembly constituency. Minor spelling variations can be corrected via Form 8.',
    primaryIdentityRule: 'Constituency ordinary residence and age verification.'
  },
  {
    id: 'general_review',
    name: 'General Document Consistency Check',
    hindiName: 'सामान्य दस्तावेज़ मिलान',
    portalDomain: 'india.gov.in',
    verifiedOfficialSourceUrl: 'https://www.india.gov.in/services',
    lastVerifiedDate: 'October 2026',
    officialNote: 'General pre-check comparing identity, date of birth, and residential details across any two official records.',
    primaryIdentityRule: 'Baseline cross-record consistency.'
  }
];

const HONORIFICS = new Set([
  'shri', 'shree', 'sri', 'smt', 'srimati', 'shrimati', 'kumari', 'km',
  'mr', 'mrs', 'ms', 'dr', 'prof', 'late', 'master', 'baby'
]);

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bengaluru: 'bengaluru',
  bombay: 'mumbai',
  mumbai: 'mumbai',
  madras: 'chennai',
  chennai: 'chennai',
  calcutta: 'kolkata',
  kolkata: 'kolkata',
  gurgaon: 'gurugram',
  gurugram: 'gurugram',
  allahabad: 'prayagraj',
  prayagraj: 'prayagraj',
  mysore: 'mysuru',
  mysuru: 'mysuru',
  baroda: 'vadodara',
  vadodara: 'vadodara',
  trivandrum: 'thiruvananthapuram',
  thiruvananthapuram: 'thiruvananthapuram',
  orissa: 'odisha',
  odisha: 'odisha',
  pondicherry: 'puducherry',
  puducherry: 'puducherry'
};

const ADDRESS_ABBREVIATIONS: Record<string, string> = {
  rd: 'road',
  st: 'street',
  apt: 'apartment',
  apts: 'apartment',
  flt: 'flat',
  flr: 'floor',
  bldg: 'building',
  opp: 'opposite',
  nr: 'near',
  crs: 'cross',
  mn: 'main',
  col: 'colony',
  sec: 'sector',
  mg: 'marg',
  ngr: 'nagar',
  po: 'post office',
  dist: 'district',
  teh: 'tehsil',
  tal: 'taluk',
  vill: 'village',
  hno: 'house number',
  no: 'number'
};

export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeNameTokens(name: string): string[] {
  const clean = normalizeText(name);
  if (!clean) return [];
  return clean.split(' ').filter((token) => token.length > 0 && !HONORIFICS.has(token));
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const matrix: number[][] = [];
  for (let i = 0; i <= m; i++) matrix[i] = [i];
  for (let j = 0; j <= n; j++) matrix[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[m][n];
}

export function stringSimilarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

export interface ParsedDate {
  raw: string;
  year?: number;
  month?: number;
  day?: number;
  isYearOnly: boolean;
  isValid: boolean;
  isoFormatted?: string;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

export function parseIndianDate(input: string): ParsedDate {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return { raw: trimmed, isYearOnly: false, isValid: false };
  }

  // Check Year-only pattern
  const yearOnlyMatch = trimmed.match(/\b(19\d{2}|20[0-2]\d)\b/);
  const hasOnlyYear = /^(?:yob|year|born)?[:\s]*(19\d{2}|20[0-2]\d)$/i.test(trimmed);

  if (hasOnlyYear && yearOnlyMatch) {
    const y = parseInt(yearOnlyMatch[1], 10);
    return {
      raw: trimmed,
      year: y,
      isYearOnly: true,
      isValid: true,
      isoFormatted: `${y}`
    };
  }

  // Check ISO format YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return {
        raw: trimmed,
        year: y,
        month: m,
        day: d,
        isYearOnly: false,
        isValid: true,
        isoFormatted: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      };
    }
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyyMatch) {
    const d = parseInt(ddmmyyyyMatch[1], 10);
    const m = parseInt(ddmmyyyyMatch[2], 10);
    const y = parseInt(ddmmyyyyMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return {
        raw: trimmed,
        year: y,
        month: m,
        day: d,
        isYearOnly: false,
        isValid: true,
        isoFormatted: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      };
    }
  }

  // Check textual date (e.g. "15 Aug 1990")
  const textDateMatch = trimmed.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (textDateMatch) {
    const d = parseInt(textDateMatch[1], 10);
    const mStr = textDateMatch[2].toLowerCase();
    const y = parseInt(textDateMatch[3], 10);
    const m = MONTH_NAMES[mStr];
    if (m && d >= 1 && d <= 31) {
      return {
        raw: trimmed,
        year: y,
        month: m,
        day: d,
        isYearOnly: false,
        isValid: true,
        isoFormatted: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      };
    }
  }

  // Fallback to year if present
  if (yearOnlyMatch) {
    const y = parseInt(yearOnlyMatch[1], 10);
    return {
      raw: trimmed,
      year: y,
      isYearOnly: true,
      isValid: true,
      isoFormatted: `${y}`
    };
  }

  return { raw: trimmed, isYearOnly: false, isValid: false };
}

export function extractPincode(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\b([1-9][0-9]{5})\b/);
  return match ? match[1] : null;
}

export function normalizeAddressTokens(address: string): string[] {
  const clean = normalizeText(address);
  if (!clean) return [];

  const rawTokens = clean.split(' ');
  const normalized: string[] = [];

  for (const token of rawTokens) {
    if (!token) continue;
    let mapped = ADDRESS_ABBREVIATIONS[token] || token;
    mapped = CITY_ALIASES[mapped] || mapped;
    normalized.push(mapped);
  }

  return normalized;
}

/**
 * Compare Cardholder Names deterministically
 */
export function compareNames(rawA: string, rawB: string): FieldComparisonResult {
  const valA = (rawA || '').trim();
  const valB = (rawB || '').trim();

  // If either value is missing, classify as Not available
  if (!valA || !valB) {
    return {
      fieldName: 'name',
      label: 'Cardholder Name',
      hindiLabel: 'नाम (कार्डधारक)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: valA ? normalizeNameTokens(valA).join(' ') : '',
      normalizedValB: valB ? normalizeNameTokens(valB).join(' ') : '',
      status: 'not_available',
      ruleId: 'RULE_NAME_MISSING',
      ruleDescription: 'Value is missing, empty, or unreadable on one or both documents.',
      explanation: !valA && !valB
        ? 'Cardholder name is not recorded on either document.'
        : `Cardholder name is present on ${valA ? 'Document A' : 'Document B'}, but missing or unreadable on ${!valA ? 'Document A' : 'Document B'}.`,
      suggestedVerification: 'Ensure a clear image is uploaded or enter the name manually before comparing.'
    };
  }

  const tokensA = normalizeNameTokens(valA);
  const tokensB = normalizeNameTokens(valB);
  const normA = tokensA.join(' ');
  const normB = tokensB.join(' ');

  // Exact normalized match
  if (normA === normB) {
    return {
      fieldName: 'name',
      label: 'Cardholder Name',
      hindiLabel: 'नाम (कार्डधारक)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: normA,
      normalizedValB: normB,
      status: 'match',
      ruleId: 'RULE_NAME_EXACT_MATCH',
      ruleDescription: 'Normalized names match identically across both documents.',
      explanation: 'All name tokens match after standardizing case, punctuation, and honorifics.',
      suggestedVerification: 'No action needed for this field.'
    };
  }

  // Token order variation (e.g. "Rajesh Kumar" vs "Kumar Rajesh")
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const allInA = tokensB.every((t) => setA.has(t));
  const allInB = tokensA.every((t) => setB.has(t));

  if (allInA && allInB && tokensA.length === tokensB.length) {
    return {
      fieldName: 'name',
      label: 'Cardholder Name',
      hindiLabel: 'नाम (कार्डधारक)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: normA,
      normalizedValB: normB,
      status: 'review',
      ruleId: 'RULE_NAME_ORDER_VARIATION',
      ruleDescription: 'Identical name words detected, but the word order is reversed or transposed.',
      explanation: `Words match but sequence differs: "${valA}" vs "${valB}".`,
      suggestedVerification: 'Check which word sequence (first name vs surname) matches the specific portal application form.'
    };
  }

  // Initials variation (e.g. "K. Suresh" vs "Suresh Kumar")
  const hasInitialsA = tokensA.some((t) => t.length === 1);
  const hasInitialsB = tokensB.some((t) => t.length === 1);

  if (hasInitialsA || hasInitialsB) {
    const isInitialOrWordMatch = (t1: string, t2: string): boolean => {
      if (t1 === t2) return true;
      if (t1.length === 1 && t2.startsWith(t1)) return true;
      if (t2.length === 1 && t1.startsWith(t2)) return true;
      return false;
    };

    const shorter = tokensA.length <= tokensB.length ? tokensA : tokensB;
    const longer = tokensA.length <= tokensB.length ? tokensB : tokensA;

    let possibleInitialMatch = false;

    // Check direct in-order match first
    if (shorter.length === longer.length) {
      possibleInitialMatch = shorter.every((sToken, idx) => isInitialOrWordMatch(sToken, longer[idx]));
    }

    // Check out-of-order permutation match
    if (!possibleInitialMatch) {
      const usedLonger = new Set<number>();
      let allMatched = true;

      for (const sToken of shorter) {
        let matchIdx = -1;
        // Priority 1: exact word match
        for (let i = 0; i < longer.length; i++) {
          if (!usedLonger.has(i) && longer[i] === sToken) {
            matchIdx = i;
            break;
          }
        }
        // Priority 2: initial expansion match
        if (matchIdx === -1) {
          for (let i = 0; i < longer.length; i++) {
            if (!usedLonger.has(i) && isInitialOrWordMatch(sToken, longer[i])) {
              matchIdx = i;
              break;
            }
          }
        }

        if (matchIdx !== -1) {
          usedLonger.add(matchIdx);
        } else {
          allMatched = false;
          break;
        }
      }

      if (allMatched && usedLonger.size === shorter.length) {
        possibleInitialMatch = true;
      }
    }

    if (possibleInitialMatch) {
      return {
        fieldName: 'name',
        label: 'Cardholder Name',
        hindiLabel: 'नाम (कार्डधारक)',
        originalValA: valA,
        originalValB: valB,
        normalizedValA: normA,
        normalizedValB: normB,
        status: 'review',
        ruleId: 'RULE_NAME_INITIAL_EXPANSION',
        ruleDescription: 'One document contains single-letter initials that match the starting letter of words in the other document.',
        explanation: 'Initial detected in one record (e.g. "K." vs "Kumar"). This requires user verification against the target service requirements.',
        suggestedVerification: 'Confirm whether your target public service accepts initials or requires fully expanded names.'
      };
    }
  }

  // Spelling similarity / minor typo
  const sim = stringSimilarity(normA, normB);
  const common = tokensA.filter((t) => setB.has(t));
  const added = tokensB.filter((t) => !setA.has(t));
  const removed = tokensA.filter((t) => !setB.has(t));

  if (sim >= 0.85) {
    return {
      fieldName: 'name',
      label: 'Cardholder Name',
      hindiLabel: 'नाम (कार्डधारक)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: normA,
      normalizedValB: normB,
      status: 'review',
      ruleId: 'RULE_NAME_SPELLING_VARIATION',
      ruleDescription: 'High character similarity (>= 85%), indicating a probable spelling or transliteration variation.',
      explanation: `Minor character difference detected: "${valA}" vs "${valB}".`,
      suggestedVerification: 'Verify which spelling matches your official civil registration records (e.g., 10th marksheet or birth certificate).',
      differences: { added, removed, common }
    };
  }

  // Dissimilar names -> Mismatch
  return {
    fieldName: 'name',
    label: 'Cardholder Name',
    hindiLabel: 'नाम (कार्डधारक)',
    originalValA: valA,
    originalValB: valB,
    normalizedValA: normA,
    normalizedValB: normB,
    status: 'mismatch',
    ruleId: 'RULE_NAME_MISMATCH',
    ruleDescription: 'Names have significant differences and do not align under deterministic rules.',
    explanation: `Names appear distinct: "${valA}" vs "${valB}".`,
    suggestedVerification: 'Confirm that both uploaded documents correspond to the same individual, or investigate necessary name correction procedures with the issuing authority.'
  };
}

/**
 * Compare Dates of Birth deterministically
 */
export function compareDOB(rawA: string, rawB: string): FieldComparisonResult {
  const valA = (rawA || '').trim();
  const valB = (rawB || '').trim();

  if (!valA || !valB) {
    return {
      fieldName: 'dob',
      label: 'Date of Birth (DOB)',
      hindiLabel: 'जन्म तिथि',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: valA,
      normalizedValB: valB,
      status: 'not_available',
      ruleId: 'RULE_DOB_MISSING',
      ruleDescription: 'Date of birth is missing or unreadable on one or both documents.',
      explanation: !valA && !valB
        ? 'Date of birth is not recorded on either document.'
        : `Date of birth is present on ${valA ? 'Document A' : 'Document B'}, but missing on ${!valA ? 'Document A' : 'Document B'}.`,
      suggestedVerification: 'Check if the document format includes date of birth, or enter the date manually.'
    };
  }

  const pA = parseIndianDate(valA);
  const pB = parseIndianDate(valB);

  if (!pA.isValid || !pB.isValid) {
    return {
      fieldName: 'dob',
      label: 'Date of Birth (DOB)',
      hindiLabel: 'जन्म तिथि',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: valA,
      normalizedValB: valB,
      status: 'review',
      ruleId: 'RULE_DOB_UNPARSED',
      ruleDescription: 'Date string format could not be verified automatically.',
      explanation: `Unable to definitively parse date strings: "${valA}" vs "${valB}".`,
      suggestedVerification: 'Review the date manually and ensure it follows DD/MM/YYYY or YYYY-MM-DD.'
    };
  }

  // Exact calendar date match
  if (!pA.isYearOnly && !pB.isYearOnly && pA.isoFormatted === pB.isoFormatted) {
    return {
      fieldName: 'dob',
      label: 'Date of Birth (DOB)',
      hindiLabel: 'जन्म तिथि',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: pA.isoFormatted || valA,
      normalizedValB: pB.isoFormatted || valB,
      status: 'match',
      ruleId: 'RULE_DOB_EXACT_MATCH',
      ruleDescription: 'Calendar birth dates (day, month, and year) match identically.',
      explanation: `Dates match: ${pA.isoFormatted}.`,
      suggestedVerification: 'No action needed for this field.'
    };
  }

  // Year-only comparison
  if (pA.isYearOnly || pB.isYearOnly) {
    if (pA.year === pB.year) {
      return {
        fieldName: 'dob',
        label: 'Date of Birth (DOB)',
        hindiLabel: 'जन्म तिथि',
        originalValA: valA,
        originalValB: valB,
        normalizedValA: pA.isoFormatted || valA,
        normalizedValB: pB.isoFormatted || valB,
        status: 'review',
        ruleId: 'RULE_DOB_YEAR_ONLY',
        ruleDescription: 'Birth year matches, but at least one document records only the Year of Birth without day and month.',
        explanation: `Birth year (${pA.year}) matches, but ${pA.isYearOnly && pB.isYearOnly ? 'both documents record only year' : pA.isYearOnly ? 'Document A records only year' : 'Document B records only year'}.`,
        suggestedVerification: 'Check if your target service requires full DD/MM/YYYY (e.g. Passport or EPFO) or accepts Year of Birth only.'
      };
    } else {
      return {
        fieldName: 'dob',
        label: 'Date of Birth (DOB)',
        hindiLabel: 'जन्म तिथि',
        originalValA: valA,
        originalValB: valB,
        normalizedValA: pA.isoFormatted || valA,
        normalizedValB: pB.isoFormatted || valB,
        status: 'mismatch',
        ruleId: 'RULE_DOB_YEAR_MISMATCH',
        ruleDescription: 'Recorded birth years do not match.',
        explanation: `Birth year difference: ${pA.year} vs ${pB.year}.`,
        suggestedVerification: 'Verify which birth year is correct according to a primary birth certificate or educational marksheet.'
      };
    }
  }

  // Day/Month inversion check
  if (pA.year === pB.year && pA.month === pB.day && pA.day === pB.month) {
    return {
      fieldName: 'dob',
      label: 'Date of Birth (DOB)',
      hindiLabel: 'जन्म तिथि',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: `${pA.day}/${pA.month}/${pA.year}`,
      normalizedValB: `${pB.day}/${pB.month}/${pB.year}`,
      status: 'mismatch',
      ruleId: 'RULE_DOB_INVERTED_FORMAT',
      ruleDescription: 'Day and Month appear swapped (e.g. DD/MM vs MM/DD).',
      explanation: `Possible day/month transposition: "${valA}" (${pA.day}-${pA.month}-${pA.year}) vs "${valB}" (${pB.day}-${pB.month}-${pB.year}).`,
      suggestedVerification: 'Check the date format of the issuing authority to determine which document has the typographical error.'
    };
  }

  // Same year, different date
  if (pA.year === pB.year) {
    return {
      fieldName: 'dob',
      label: 'Date of Birth (DOB)',
      hindiLabel: 'जन्म तिथि',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: pA.isoFormatted || valA,
      normalizedValB: pB.isoFormatted || valB,
      status: 'mismatch',
      ruleId: 'RULE_DOB_DATE_MISMATCH',
      ruleDescription: 'Birth year matches, but day or month differs.',
      explanation: `Calendar date differs within the same year: ${pA.isoFormatted} vs ${pB.isoFormatted}.`,
      suggestedVerification: 'Confirm exact birth date against statutory birth registration records.'
    };
  }

  // Entirely different dates
  return {
    fieldName: 'dob',
    label: 'Date of Birth (DOB)',
    hindiLabel: 'जन्म तिथि',
    originalValA: valA,
    originalValB: valB,
    normalizedValA: pA.isoFormatted || valA,
    normalizedValB: pB.isoFormatted || valB,
    status: 'mismatch',
    ruleId: 'RULE_DOB_FULL_MISMATCH',
    ruleDescription: 'Dates of birth are completely different.',
    explanation: `Different dates of birth: ${pA.isoFormatted || valA} vs ${pB.isoFormatted || valB}.`,
    suggestedVerification: 'Investigate the discrepancy with the respective issuing authority.'
  };
}

/**
 * Compare Addresses deterministically
 */
export function compareAddresses(rawA: string, rawB: string, pinA?: string, pinB?: string): FieldComparisonResult {
  const valA = (rawA || '').trim();
  const valB = (rawB || '').trim();

  if (!valA || !valB) {
    return {
      fieldName: 'address',
      label: 'Residential Address',
      hindiLabel: 'पता (आवास)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: valA,
      normalizedValB: valB,
      status: 'not_available',
      ruleId: 'RULE_ADDRESS_MISSING',
      ruleDescription: 'Address is not recorded or unreadable on one or both documents.',
      explanation: !valA && !valB
        ? 'Address is not recorded on either document.'
        : `Address is present on ${valA ? 'Document A' : 'Document B'}, but not recorded on ${!valA ? 'Document A' : 'Document B'} (e.g. standard PAN cards do not display residential address).`,
      suggestedVerification: 'If your target service requires address verification, verify whether Document A or B serves as proof of residence.'
    };
  }

  const foundPinA = pinA || extractPincode(valA);
  const foundPinB = pinB || extractPincode(valB);
  const tokensA = normalizeAddressTokens(valA);
  const tokensB = normalizeAddressTokens(valB);

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const common = tokensA.filter((t) => setB.has(t));
  const union = new Set([...tokensA, ...tokensB]);
  const jaccard = union.size > 0 ? common.length / union.size : 0;
  const sim = stringSimilarity(tokensA.join(' '), tokensB.join(' '));

  const hasBothPins = Boolean(foundPinA && foundPinB);
  const pinsMatch = hasBothPins && foundPinA === foundPinB;
  const pinsDiffer = hasBothPins && foundPinA !== foundPinB;

  // High overlap and matching/absent pin difference
  if ((jaccard >= 0.7 || sim >= 0.8) && !pinsDiffer) {
    return {
      fieldName: 'address',
      label: 'Residential Address',
      hindiLabel: 'पता (आवास)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: tokensA.join(' '),
      normalizedValB: tokensB.join(' '),
      status: 'match',
      ruleId: 'RULE_ADDRESS_MATCH',
      ruleDescription: 'Address components, locality, and postal codes correspond closely.',
      explanation: 'Addresses align across key location tokens.',
      suggestedVerification: 'No action needed for this field.'
    };
  }

  if (pinsDiffer) {
    return {
      fieldName: 'address',
      label: 'Residential Address',
      hindiLabel: 'पता (आवास)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: tokensA.join(' '),
      normalizedValB: tokensB.join(' '),
      status: 'mismatch',
      ruleId: 'RULE_ADDRESS_PIN_MISMATCH',
      ruleDescription: 'PIN codes differ between the two documents, indicating different postal delivery areas.',
      explanation: `Different PIN codes detected: ${foundPinA} vs ${foundPinB}.`,
      suggestedVerification: 'Check if one document records a permanent address while the other records a present residential address.'
    };
  }

  if (jaccard >= 0.4 || sim >= 0.5) {
    return {
      fieldName: 'address',
      label: 'Residential Address',
      hindiLabel: 'पता (आवास)',
      originalValA: valA,
      originalValB: valB,
      normalizedValA: tokensA.join(' '),
      normalizedValB: tokensB.join(' '),
      status: 'review',
      ruleId: 'RULE_ADDRESS_FORMAT_VARIATION',
      ruleDescription: 'Moderate token overlap; address components share similarities but formatting, house numbers, or abbreviations vary.',
      explanation: 'Locality or city corresponds, but specific wording differs.',
      suggestedVerification: 'Review whether the differences are formatting variations or represent a change of residence.'
    };
  }

  return {
    fieldName: 'address',
    label: 'Residential Address',
    hindiLabel: 'पता (आवास)',
    originalValA: valA,
    originalValB: valB,
    normalizedValA: tokensA.join(' '),
    normalizedValB: tokensB.join(' '),
    status: 'mismatch',
    ruleId: 'RULE_ADDRESS_MISMATCH',
    ruleDescription: 'Address details differ substantially without significant token overlap.',
    explanation: 'Addresses appear to refer to different residential locations.',
    suggestedVerification: 'Confirm which address reflects your present residence.'
  };
}

/**
 * Compare Father or Spouse Name
 */
export function compareFatherOrSpouse(rawA: string, rawB: string): FieldComparisonResult {
  const cleanA = (rawA || '').replace(/^(s\/o|d\/o|w\/o|c\/o|care of|son of|daughter of|wife of)[:\s]*/i, '').trim();
  const cleanB = (rawB || '').replace(/^(s\/o|d\/o|w\/o|c\/o|care of|son of|daughter of|wife of)[:\s]*/i, '').trim();

  if (!cleanA || !cleanB) {
    return {
      fieldName: 'fatherOrSpouseName',
      label: 'Father / Spouse Name',
      hindiLabel: 'पिता / पति का नाम',
      originalValA: rawA || '',
      originalValB: rawB || '',
      normalizedValA: cleanA,
      normalizedValB: cleanB,
      status: 'not_available',
      ruleId: 'RULE_GUARDIAN_MISSING',
      ruleDescription: 'Father or spouse name is not recorded on one or both documents.',
      explanation: !cleanA && !cleanB
        ? 'Guardian name is not present on either document.'
        : `Present on ${cleanA ? 'Document A' : 'Document B'}, but not on ${!cleanA ? 'Document A' : 'Document B'}.`,
      suggestedVerification: 'Verify whether guardian name is required for your specific application.'
    };
  }

  const res = compareNames(cleanA, cleanB);
  return {
    ...res,
    fieldName: 'fatherOrSpouseName',
    label: 'Father / Spouse Name',
    hindiLabel: 'पिता / पति का नाम',
    suggestedVerification: res.status === 'match'
      ? 'No action needed.'
      : 'Verify guardian name against educational records or official family records.'
  };
}

/**
 * Compare PIN Code
 */
export function comparePincode(pinA?: string, pinB?: string): FieldComparisonResult {
  const pA = (pinA || '').trim();
  const pB = (pinB || '').trim();

  if (!pA || !pB) {
    return {
      fieldName: 'pincode',
      label: 'Postal PIN Code',
      hindiLabel: 'पिन कोड',
      originalValA: pA,
      originalValB: pB,
      normalizedValA: pA,
      normalizedValB: pB,
      status: 'not_available',
      ruleId: 'RULE_PIN_MISSING',
      ruleDescription: '6-digit postal PIN code is absent on one or both documents.',
      explanation: 'PIN code is not provided on both documents.',
      suggestedVerification: 'Confirm your 6-digit postal code if residential verification is required.'
    };
  }

  if (pA === pB) {
    return {
      fieldName: 'pincode',
      label: 'Postal PIN Code',
      hindiLabel: 'पिन कोड',
      originalValA: pA,
      originalValB: pB,
      normalizedValA: pA,
      normalizedValB: pB,
      status: 'match',
      ruleId: 'RULE_PIN_MATCH',
      ruleDescription: 'PIN codes match identically.',
      explanation: `Both documents record PIN code ${pA}.`,
      suggestedVerification: 'No action needed for this field.'
    };
  }

  return {
    fieldName: 'pincode',
    label: 'Postal PIN Code',
    hindiLabel: 'पिन कोड',
    originalValA: pA,
    originalValB: pB,
    normalizedValA: pA,
    normalizedValB: pB,
    status: 'mismatch',
    ruleId: 'RULE_PIN_MISMATCH',
    ruleDescription: 'PIN codes differ, indicating different postal delivery sub-districts.',
    explanation: `PIN codes differ: ${pA} vs ${pB}.`,
    suggestedVerification: 'Confirm your current residential PIN code.'
  };
}

/**
 * Compare Gender
 */
export function compareGender(genA?: string, genB?: string): FieldComparisonResult {
  const gA = (genA || '').toUpperCase().trim();
  const gB = (genB || '').toUpperCase().trim();

  if (!gA || !gB) {
    return {
      fieldName: 'gender',
      label: 'Gender',
      hindiLabel: 'लिंग',
      originalValA: genA || '',
      originalValB: genB || '',
      normalizedValA: gA,
      normalizedValB: gB,
      status: 'not_available',
      ruleId: 'RULE_GENDER_MISSING',
      ruleDescription: 'Gender is not recorded on one or both documents.',
      explanation: 'Gender information is absent on one or both records.',
      suggestedVerification: 'Ensure gender is stated if mandatory for your application portal.'
    };
  }

  const normA = gA.startsWith('M') ? 'MALE' : gA.startsWith('F') ? 'FEMALE' : 'OTHER';
  const normB = gB.startsWith('M') ? 'MALE' : gB.startsWith('F') ? 'FEMALE' : 'OTHER';

  if (normA === normB) {
    return {
      fieldName: 'gender',
      label: 'Gender',
      hindiLabel: 'लिंग',
      originalValA: genA || '',
      originalValB: genB || '',
      normalizedValA: normA,
      normalizedValB: normB,
      status: 'match',
      ruleId: 'RULE_GENDER_MATCH',
      ruleDescription: 'Gender values correspond identically.',
      explanation: `Gender matches: ${normA}.`,
      suggestedVerification: 'No action needed.'
    };
  }

  return {
    fieldName: 'gender',
    label: 'Gender',
    hindiLabel: 'लिंग',
    originalValA: genA || '',
    originalValB: genB || '',
    normalizedValA: normA,
    normalizedValB: normB,
    status: 'mismatch',
    ruleId: 'RULE_GENDER_MISMATCH',
    ruleDescription: 'Gender values conflict between documents.',
    explanation: `Gender entries conflict: ${normA} vs ${normB}.`,
    suggestedVerification: 'Resolve conflicting gender records prior to demographic seeding.'
  };
}

/**
 * Generate Master Comparison Report without unvalidated readiness scores or rejection predictors
 */
export function generateComparisonReport(
  docA: DocumentFields,
  docB: DocumentFields,
  serviceId: string = 'general_review'
): ComparisonReport {
  const guidance = OFFICIAL_SERVICE_GUIDELINES.find((s) => s.id === serviceId) || OFFICIAL_SERVICE_GUIDELINES[0];

  const nameRes = compareNames(docA.name, docB.name);
  const dobRes = compareDOB(docA.dob, docB.dob);
  const addrRes = compareAddresses(docA.address, docB.address, docA.pincode, docB.pincode);
  const fRes = compareFatherOrSpouse(docA.fatherOrSpouseName, docB.fatherOrSpouseName);
  const pinRes = comparePincode(
    docA.pincode || extractPincode(docA.address) || '',
    docB.pincode || extractPincode(docB.address) || ''
  );
  const genRes = compareGender(docA.gender, docB.gender);

  const allResults = [nameRes, dobRes, addrRes, fRes, pinRes, genRes];

  const statusCounts = {
    match: 0,
    review: 0,
    mismatch: 0,
    notAvailable: 0
  };

  for (const r of allResults) {
    if (r.status === 'match') statusCounts.match++;
    else if (r.status === 'review') statusCounts.review++;
    else if (r.status === 'mismatch') statusCounts.mismatch++;
    else if (r.status === 'not_available') statusCounts.notAvailable++;
  }

  // Findings-driven verification checklist (generated strictly from discrepancies or reviews)
  const checklist: VerificationChecklistItem[] = [];

  if (nameRes.status === 'review' || nameRes.status === 'mismatch') {
    checklist.push({
      id: 'chk-name',
      field: nameRes.label,
      status: nameRes.status,
      issue: nameRes.explanation,
      suggestedAction: nameRes.suggestedVerification,
      sourceReference: guidance.verifiedOfficialSourceUrl
    });
  }

  if (dobRes.status === 'review' || dobRes.status === 'mismatch') {
    checklist.push({
      id: 'chk-dob',
      field: dobRes.label,
      status: dobRes.status,
      issue: dobRes.explanation,
      suggestedAction: dobRes.suggestedVerification,
      sourceReference: guidance.verifiedOfficialSourceUrl
    });
  }

  if (addrRes.status === 'review' || addrRes.status === 'mismatch') {
    checklist.push({
      id: 'chk-addr',
      field: addrRes.label,
      status: addrRes.status,
      issue: addrRes.explanation,
      suggestedAction: addrRes.suggestedVerification,
      sourceReference: guidance.verifiedOfficialSourceUrl
    });
  }

  if (pinRes.status === 'mismatch') {
    checklist.push({
      id: 'chk-pin',
      field: pinRes.label,
      status: pinRes.status,
      issue: pinRes.explanation,
      suggestedAction: pinRes.suggestedVerification,
      sourceReference: guidance.verifiedOfficialSourceUrl
    });
  }

  if (genRes.status === 'mismatch') {
    checklist.push({
      id: 'chk-gender',
      field: genRes.label,
      status: genRes.status,
      issue: genRes.explanation,
      suggestedAction: genRes.suggestedVerification,
      sourceReference: guidance.verifiedOfficialSourceUrl
    });
  }

  // Descriptive neutral summary without scores
  let summaryText = '';
  if (statusCounts.match === 0 && statusCounts.review === 0 && statusCounts.mismatch === 0) {
    summaryText = 'No data entered yet. Upload or enter document fields above to begin cross-verification.';
  } else {
    const parts = [
      `${statusCounts.match} exact ${statusCounts.match === 1 ? 'match' : 'matches'}`,
      `${statusCounts.review} ${statusCounts.review === 1 ? 'field' : 'fields'} requiring review`,
      `${statusCounts.mismatch} ${statusCounts.mismatch === 1 ? 'mismatch' : 'mismatches'}`,
      `${statusCounts.notAvailable} not available`
    ];
    summaryText = `Comparison findings across 6 fields: ${parts.join(', ')}.`;
  }

  return {
    statusCounts,
    totalFieldsCompared: allResults.length,
    summaryText,
    fieldResults: {
      name: nameRes,
      dob: dobRes,
      address: addrRes,
      fatherOrSpouseName: fRes,
      pincode: pinRes,
      gender: genRes
    },
    checklist,
    serviceGuidance: guidance,
    evaluatedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    limitationsNotice: 'Informational pre-check utility. SevaSetu is an explainable consistency tool and does not certify identity, verify legal validity, authenticate documents, or guarantee government acceptance.'
  };
}
