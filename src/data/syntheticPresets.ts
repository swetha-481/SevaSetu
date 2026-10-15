/**
 * SevaSetu - Synthetic Fictional Indian Documents
 * Designed for offline testing, demos, and instant zero-friction verification.
 * Strictly fictional identities and synthetic numbers complying with privacy rules.
 */

import { DocumentFields } from '../types/document';

export interface SyntheticTestCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  recommendedService: string;
  docA: DocumentFields;
  docB: DocumentFields;
}

export const SYNTHETIC_TEST_CASES: SyntheticTestCase[] = [
  {
    id: 'initials_abbreviation',
    title: 'Initials & Address Abbreviation',
    subtitle: 'Document A (Full Name) vs Document B (Initial "K.")',
    badge: 'Initials Variation',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Document A records "Suresh Kumar", while Document B records "Suresh K". Both share the same date of birth.',
    recommendedService: 'passport',
    docA: {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-4921',
      name: 'Suresh Kumar',
      fatherOrSpouseName: 'Narayana Swamy',
      dob: '1990-05-14',
      gender: 'MALE',
      address: 'Flat 302, Sai Shanti Apts, 5th Cross, Malleshwaram, Bengaluru, Karnataka',
      pincode: '560003',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    },
    docB: {
      documentType: 'pan',
      documentNumber: 'ABCPS4921K',
      name: 'Suresh K',
      fatherOrSpouseName: 'Narayana Swamy',
      dob: '1990-05-14',
      gender: 'MALE',
      address: '',
      pincode: '',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true }
      }
    }
  },
  {
    id: 'perfect_alignment',
    title: 'Matching Records (Gurugram/Gurgaon)',
    subtitle: 'Document A vs Document B (Same Person Details)',
    badge: 'Exact Match',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'All identity attributes correspond. City alias "Gurugram" and "Gurgaon" share the same pincode and locality.',
    recommendedService: 'voter_id',
    docA: {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-8192',
      name: 'Priya Sharma',
      fatherOrSpouseName: 'Ramesh Sharma',
      dob: '1994-11-22',
      gender: 'FEMALE',
      address: 'House No 45, Sector 14, Urban Estate, Gurugram, Haryana',
      pincode: '122001',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    },
    docB: {
      documentType: 'voter_id',
      documentNumber: 'ECI9284710',
      name: 'Priya Sharma',
      fatherOrSpouseName: 'Ramesh Sharma',
      dob: '1994-11-22',
      gender: 'FEMALE',
      address: 'H No 45, Sector 14, Urban Estate, Gurgaon, Haryana',
      pincode: '122001',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    }
  },
  {
    id: 'dob_inversion_and_address',
    title: 'DOB Day/Month Inversion & Address Difference',
    subtitle: 'Document A (05/10/1988) vs Document B (10/05/1988)',
    badge: 'Discrepancy Detected',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Day and Month entries are inverted between records (5th October vs 10th May). Residential addresses also reflect different cities.',
    recommendedService: 'driving_license',
    docA: {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-3051',
      name: 'Mohammad Tariq Khan',
      fatherOrSpouseName: 'Abdul Tariq Khan',
      dob: '05/10/1988',
      gender: 'MALE',
      address: 'Plot 18, Indira Nagar, Ring Road, Lucknow, Uttar Pradesh',
      pincode: '226016',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    },
    docB: {
      documentType: 'driving_license',
      documentNumber: 'KA-04-2015003921',
      name: 'Mohd Tariq Khan',
      fatherOrSpouseName: 'Abdul Tariq Khan',
      dob: '10/05/1988',
      gender: 'MALE',
      address: 'B-404, Maple Woods, Whitefield Main Road, Bengaluru, Karnataka',
      pincode: '560066',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    }
  },
  {
    id: 'year_only_aadhaar',
    title: 'Year-of-Birth Only Record',
    subtitle: 'Document A ("1982") vs Document B ("18/07/1982")',
    badge: 'Year-Only Date',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Document A records only the birth year (1982), while Document B records the complete date of birth (18/07/1982).',
    recommendedService: 'epfo_kyc',
    docA: {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-6701',
      name: 'Rajeshwari Devi',
      fatherOrSpouseName: 'Harish Chandra',
      dob: '1982',
      gender: 'FEMALE',
      address: 'Village Rampur, Post Kalan, Tehsil Sadar, Varanasi, Uttar Pradesh',
      pincode: '221001',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    },
    docB: {
      documentType: 'marksheet',
      documentNumber: 'UP-BOARD-82-41902',
      name: 'Rajeshwari Devi',
      fatherOrSpouseName: 'Harish Chandra',
      dob: '1982-07-18',
      gender: 'FEMALE',
      address: 'Village Rampur, Varanasi, Uttar Pradesh',
      pincode: '221001',
      fieldMeta: {
        name: { source: 'preset', isConfirmed: true },
        dob: { source: 'preset', isConfirmed: true },
        address: { source: 'preset', isConfirmed: true }
      }
    }
  }
];

// Helper to generate a neutral synthetic card SVG preview data URL
export function generateSyntheticCardSvg(doc: DocumentFields, docLabel: string): string {
  const isAadhaar = doc.documentType === 'aadhaar';
  const isPan = doc.documentType === 'pan';
  const isPassport = doc.documentType === 'passport';
  const isDL = doc.documentType === 'driving_license';

  const themeBg = isAadhaar
    ? '#ffffff'
    : isPan
    ? '#e0f2fe'
    : isPassport
    ? '#1e293b'
    : isDL
    ? '#fef3c7'
    : '#f8fafc';

  const headerBg = isAadhaar
    ? '#991b1b'
    : isPan
    ? '#0369a1'
    : isPassport
    ? '#0f172a'
    : isDL
    ? '#92400e'
    : '#334155';

  const titleText = isAadhaar
    ? 'SAMPLE AADHAAR CARD'
    : isPan
    ? 'SAMPLE PAN CARD'
    : isPassport
    ? 'SAMPLE PASSPORT'
    : isDL
    ? 'SAMPLE DRIVING LICENCE'
    : 'SAMPLE IDENTITY DOCUMENT';

  const textColor = isPassport ? '#f8fafc' : '#0f172a';
  const subTextColor = isPassport ? '#94a3b8' : '#475569';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
    <rect width="480" height="300" rx="16" fill="${themeBg}" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M 0 16 C 0 7.16 7.16 0 16 0 L 464 0 C 472.84 0 480 7.16 480 16 L 480 48 L 0 48 Z" fill="${headerBg}"/>
    
    <text x="24" y="30" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="1">
      ${titleText}
    </text>

    <!-- Synthetic Badge -->
    <rect x="360" y="14" width="100" height="20" rx="4" fill="#000000" fill-opacity="0.3"/>
    <text x="410" y="28" fill="#facc15" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">
      SYNTHETIC / DEMO
    </text>

    <!-- Avatar Placeholder -->
    <rect x="24" y="68" width="90" height="110" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="69" cy="110" r="24" fill="#94a3b8"/>
    <path d="M 45 160 C 45 138 93 138 93 160 Z" fill="#94a3b8"/>
    <text x="69" y="195" fill="#64748b" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Photo ID</text>

    <!-- Data Fields -->
    <text x="130" y="86" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="11">Name / नाम:</text>
    <text x="130" y="106" fill="${textColor}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${escapeXml(doc.name || 'NOT SPECIFIED')}</text>

    <text x="130" y="130" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="11">DOB / जन्म तिथि:</text>
    <text x="130" y="148" fill="${textColor}" font-family="Arial, sans-serif" font-size="13" font-weight="600">${escapeXml(doc.dob || 'NOT SPECIFIED')}</text>

    <text x="280" y="130" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="11">Gender / लिंग:</text>
    <text x="280" y="148" fill="${textColor}" font-family="Arial, sans-serif" font-size="13" font-weight="600">${escapeXml(doc.gender || '—')}</text>

    <text x="130" y="172" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="11">Father / Spouse:</text>
    <text x="130" y="190" fill="${textColor}" font-family="Arial, sans-serif" font-size="12" font-weight="500">${escapeXml(doc.fatherOrSpouseName || '—')}</text>

    <!-- Address snippet -->
    <text x="24" y="222" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="10">Address / पता:</text>
    <text x="24" y="238" fill="${textColor}" font-family="Arial, sans-serif" font-size="10" width="430">${escapeXml((doc.address || 'Address not recorded on this card').slice(0, 75))}${doc.address && doc.address.length > 75 ? '...' : ''}</text>
    <text x="24" y="254" fill="${textColor}" font-family="Arial, sans-serif" font-size="10" font-weight="600">PIN: ${escapeXml(doc.pincode || '—')}</text>

    <!-- Footer Document ID -->
    <line x1="20" y1="266" x2="460" y2="266" stroke="#cbd5e1" stroke-width="1"/>
    <text x="24" y="284" fill="${subTextColor}" font-family="Arial, sans-serif" font-size="10">${escapeXml(docLabel)}: <tspan font-weight="bold" fill="${textColor}">${escapeXml(doc.documentNumber || 'DEMO-REF')}</tspan></text>
    <text x="456" y="284" fill="#64748b" font-family="Arial, sans-serif" font-size="10" text-anchor="end">Fictional Demo Record</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
