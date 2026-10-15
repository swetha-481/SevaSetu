/**
 * SevaSetu Comprehensive Test Suite
 * Tests deterministic comparison logic, missing values, initials, spelling variations,
 * date-format differences, year-only dates, address differences, rule descriptions,
 * and safety against fabricated confidence values.
 */

import {
  compareNames,
  compareDOB,
  compareAddresses,
  comparePincode,
  compareGender,
  generateComparisonReport,
  OFFICIAL_SERVICE_GUIDELINES
} from '../src/utils/comparator';
import { SYNTHETIC_TEST_CASES } from '../src/data/syntheticPresets';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`PASS: ${testName}`);
  } else {
    console.error(`FAIL: ${testName}`, details || '');
    throw new Error(`Test assertion failed for: ${testName}`);
  }
}

console.log('\n========================================');
console.log('RUNNING SEVASETU UNIT & FUNCTIONAL TESTS');
console.log('========================================\n');

// 1. Missing Values Tests (Requirement 2 & 6: Classify as Not available if missing in either)
console.log('--- 1. Missing Value Classifications ---');

const nameMissingBoth = compareNames('', '');
assert(nameMissingBoth.status === 'not_available', 'Name missing in both -> not_available');
assert(nameMissingBoth.ruleId === 'RULE_NAME_MISSING', 'Name missing ruleId is RULE_NAME_MISSING');

const nameMissingOne = compareNames('Suresh Kumar', '');
assert(nameMissingOne.status === 'not_available', 'Name missing in Doc B -> not_available');

const dobMissingBoth = compareDOB('', '');
assert(dobMissingBoth.status === 'not_available', 'DOB missing in both -> not_available');

const dobMissingOne = compareDOB('1990-05-14', '');
assert(dobMissingOne.status === 'not_available', 'DOB missing in Doc B -> not_available');

const addrMissingOne = compareAddresses('Malleshwaram, Bengaluru', '');
assert(addrMissingOne.status === 'not_available', 'Address missing in Doc B -> not_available');

const pinMissing = comparePincode('560003', '');
assert(pinMissing.status === 'not_available', 'Pincode missing in Doc B -> not_available');

// 2. Exact Matches Tests
console.log('\n--- 2. Exact Match Handling ---');

const nameExact = compareNames('Suresh Kumar', 'Suresh Kumar');
assert(nameExact.status === 'match', 'Exact name match -> match');
assert(nameExact.ruleId === 'RULE_NAME_EXACT_MATCH', 'Exact name ruleId is RULE_NAME_EXACT_MATCH');
assert(nameExact.originalValA === 'Suresh Kumar' && nameExact.originalValB === 'Suresh Kumar', 'Preserves original values');

const nameHonorificMatch = compareNames('Shri Suresh Kumar', 'Suresh Kumar');
assert(nameHonorificMatch.status === 'match', 'Name matches after normalizing honorific "Shri"');

const dobExact = compareDOB('1990-05-14', '14/05/1990');
assert(dobExact.status === 'match', 'Exact DOB cross-format (ISO vs DD/MM/YYYY) -> match');
assert(dobExact.ruleId === 'RULE_DOB_EXACT_MATCH', 'Exact DOB ruleId is RULE_DOB_EXACT_MATCH');

const dobTextualMatch = compareDOB('15 Aug 1990', '15/08/1990');
assert(dobTextualMatch.status === 'match', 'Exact DOB textual month ("15 Aug 1990") vs numeric -> match');

const pinMatch = comparePincode('560003', '560003');
assert(pinMatch.status === 'match', 'Matching PIN code -> match');

const genderMatch = compareGender('MALE', 'Male');
assert(genderMatch.status === 'match', 'Matching gender normalized -> match');

// 3. Initials and Abbreviation Variations
console.log('\n--- 3. Initials and Abbreviation Variations ---');

const nameInitials1 = compareNames('Suresh Kumar', 'Suresh K');
assert(nameInitials1.status === 'review', 'Initials variation (Suresh Kumar vs Suresh K) -> review');
assert(nameInitials1.ruleId === 'RULE_NAME_INITIAL_EXPANSION', 'Rule is RULE_NAME_INITIAL_EXPANSION');

const nameInitials2 = compareNames('K Suresh', 'Kumar Suresh');
assert(nameInitials2.status === 'review', 'Leading initial (K Suresh vs Kumar Suresh) -> review');

// 4. Token Order Variations
console.log('\n--- 4. Token Order Variations ---');

const nameSwapped = compareNames('Kumar Rajesh', 'Rajesh Kumar');
assert(nameSwapped.status === 'review', 'Swapped word order -> review');
assert(nameSwapped.ruleId === 'RULE_NAME_ORDER_VARIATION', 'Rule is RULE_NAME_ORDER_VARIATION');

// 5. Minor Spelling Variations (Levenshtein >= 0.85)
console.log('\n--- 5. Spelling Variations ---');

const nameSpelling = compareNames('Rajesh Choudhary', 'Rajesh Chaudhary');
assert(nameSpelling.status === 'review', 'Minor transliteration variation -> review');
assert(nameSpelling.ruleId === 'RULE_NAME_SPELLING_VARIATION', 'Rule is RULE_NAME_SPELLING_VARIATION');
assert(Boolean(nameSpelling.differences), 'Provides token differences breakdown');

const nameDistinct = compareNames('Aarav Sharma', 'Vijay Verma');
assert(nameDistinct.status === 'mismatch', 'Different name identity -> mismatch');
assert(nameDistinct.ruleId === 'RULE_NAME_MISMATCH', 'Rule is RULE_NAME_MISMATCH');

// 6. Year-Only Date of Birth Comparisons
console.log('\n--- 6. Year-Only DOB Comparisons ---');

const dobYearOnlyMatch = compareDOB('1982', '18/07/1982');
assert(dobYearOnlyMatch.status === 'review', 'Year-only Aadhaar vs full DOB -> review');
assert(dobYearOnlyMatch.ruleId === 'RULE_DOB_YEAR_ONLY', 'Rule is RULE_DOB_YEAR_ONLY');
assert(dobYearOnlyMatch.explanation.includes('records only year'), 'Explains that only year is verifiable');

const dobBothYearOnly = compareDOB('1982', '1982');
assert(dobBothYearOnly.status === 'review', 'Both year-only -> review');

const dobYearMismatch = compareDOB('1982', '18/07/1988');
assert(dobYearMismatch.status === 'mismatch', 'Different birth years -> mismatch');
assert(dobYearMismatch.ruleId === 'RULE_DOB_YEAR_MISMATCH', 'Rule is RULE_DOB_YEAR_MISMATCH');

// 7. Day/Month Inversion Detection
console.log('\n--- 7. Day/Month Inversion Detection ---');

const dobInverted = compareDOB('05/10/1988', '10/05/1988');
assert(dobInverted.status === 'mismatch', 'Inverted day/month (05/10 vs 10/05) -> mismatch');
assert(dobInverted.ruleId === 'RULE_DOB_INVERTED_FORMAT', 'Rule is RULE_DOB_INVERTED_FORMAT');

// 8. Address and Pincode Comparisons
console.log('\n--- 8. Address and Pincode Comparisons ---');

const addrAliasMatch = compareAddresses(
  'House No 45, Sector 14, Urban Estate, Gurugram, Haryana',
  'H No 45, Sector 14, Urban Estate, Gurgaon, Haryana',
  '122001',
  '122001'
);
assert(addrAliasMatch.status === 'match', 'Address with city alias (Gurugram/Gurgaon) & matching PIN -> match');

const addrPinMismatch = compareAddresses(
  'Plot 18, Indira Nagar, Lucknow, UP',
  'B-404, Maple Woods, Whitefield, Bengaluru',
  '226016',
  '560066'
);
assert(addrPinMismatch.status === 'mismatch', 'Different PIN codes -> mismatch');
assert(addrPinMismatch.ruleId === 'RULE_ADDRESS_PIN_MISMATCH', 'Rule is RULE_ADDRESS_PIN_MISMATCH');

// 9. Master Report Generation (No unvalidated scores or prediction)
console.log('\n--- 9. Master Report Generation & Official Citations ---');

const reportInitials = generateComparisonReport(
  SYNTHETIC_TEST_CASES[0].docA,
  SYNTHETIC_TEST_CASES[0].docB,
  'passport'
);

assert(reportInitials.statusCounts.review > 0, 'Report reflects review status count');
assert((reportInitials as any).readinessScore === undefined, 'Does NOT output unvalidated readinessScore');
assert(reportInitials.serviceGuidance.verifiedOfficialSourceUrl.startsWith('https://'), 'Includes verified official URL');
assert(Boolean(reportInitials.serviceGuidance.lastVerifiedDate), 'Includes last-verified date');
assert(reportInitials.checklist.length > 0, 'Generates findings-driven checklist');

// Check all public services guidance entries have valid https URLs and last checked dates
for (const srv of OFFICIAL_SERVICE_GUIDELINES) {
  assert(srv.verifiedOfficialSourceUrl.startsWith('https://'), `${srv.id} has verified HTTPS source URL`);
  assert(srv.lastVerifiedDate.includes('2026'), `${srv.id} has recent verification date`);
}

console.log('\n========================================');
console.log(`ALL ${passedTests} OF ${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('========================================\n');
