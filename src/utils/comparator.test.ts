/**
 * SevaSetu - Unit Test Suite for Deterministic Document Comparator
 * Tests:
 * 1. Missing values (Not available classification)
 * 2. Exact matches (casing, honorifics, aliases)
 * 3. Initials and token expansions
 * 4. Date comparisons (exact, year-only, day/month inversion, date mismatch)
 * 5. Address variations and PIN code discrepancies
 * 6. Full report aggregation and checklist generation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareNames,
  compareDOB,
  compareAddresses,
  compareFatherOrSpouse,
  comparePincode,
  compareGender,
  generateComparisonReport,
  normalizeText,
  parseIndianDate
} from './comparator.js';
import { DocumentFields } from '../types/document.js';

describe('1. Missing Values (Not Available Classification)', () => {
  it('classifies name as not_available when empty on either or both documents', () => {
    const resBothEmpty = compareNames('', '');
    assert.strictEqual(resBothEmpty.status, 'not_available');
    assert.strictEqual(resBothEmpty.ruleId, 'RULE_NAME_MISSING');

    const resAEmpty = compareNames('', 'Rajesh Kumar');
    assert.strictEqual(resAEmpty.status, 'not_available');
    assert.strictEqual(resAEmpty.ruleId, 'RULE_NAME_MISSING');

    const resBEmpty = compareNames('Rajesh Kumar', '   ');
    assert.strictEqual(resBEmpty.status, 'not_available');
    assert.strictEqual(resBEmpty.ruleId, 'RULE_NAME_MISSING');
  });

  it('classifies DOB as not_available when missing on either document', () => {
    const res1 = compareDOB('', '15/08/1990');
    assert.strictEqual(res1.status, 'not_available');
    assert.strictEqual(res1.ruleId, 'RULE_DOB_MISSING');

    const res2 = compareDOB('1990-08-15', '');
    assert.strictEqual(res2.status, 'not_available');

    const res3 = compareDOB('', '');
    assert.strictEqual(res3.status, 'not_available');
  });

  it('classifies Address as not_available when absent on one or both documents', () => {
    const res1 = compareAddresses('Flat 402, Lotus Apts, Bangalore', '');
    assert.strictEqual(res1.status, 'not_available');
    assert.strictEqual(res1.ruleId, 'RULE_ADDRESS_MISSING');

    const res2 = compareAddresses('', '');
    assert.strictEqual(res2.status, 'not_available');
  });

  it('classifies Father/Spouse as not_available when missing', () => {
    const res = compareFatherOrSpouse('S/O Ramesh Kumar', '');
    assert.strictEqual(res.status, 'not_available');
    assert.strictEqual(res.ruleId, 'RULE_GUARDIAN_MISSING');
  });

  it('classifies Pincode as not_available when missing', () => {
    const res = comparePincode('560001', '');
    assert.strictEqual(res.status, 'not_available');
    assert.strictEqual(res.ruleId, 'RULE_PIN_MISSING');
  });

  it('classifies Gender as not_available when missing', () => {
    const res = compareGender('', 'FEMALE');
    assert.strictEqual(res.status, 'not_available');
    assert.strictEqual(res.ruleId, 'RULE_GENDER_MISSING');
  });
});

describe('2. Exact Matches (Normalization & Standard Aliases)', () => {
  it('matches identical names ignoring case and punctuation', () => {
    const res = compareNames('RAJESH KUMAR', 'rajesh kumar');
    assert.strictEqual(res.status, 'match');
    assert.strictEqual(res.ruleId, 'RULE_NAME_EXACT_MATCH');
  });

  it('matches names with honorific differences (Shri, Mr, etc.)', () => {
    const res = compareNames('Shri Rajesh Kumar', 'Rajesh Kumar');
    assert.strictEqual(res.status, 'match');
    assert.strictEqual(res.ruleId, 'RULE_NAME_EXACT_MATCH');
  });

  it('matches DOB across DD/MM/YYYY, ISO YYYY-MM-DD, and textual formats', () => {
    const res1 = compareDOB('15/08/1990', '1990-08-15');
    assert.strictEqual(res1.status, 'match');
    assert.strictEqual(res1.ruleId, 'RULE_DOB_EXACT_MATCH');

    const res2 = compareDOB('15 Aug 1990', '15/08/1990');
    assert.strictEqual(res2.status, 'match');

    const res3 = compareDOB('05/03/1985', '5/3/1985');
    assert.strictEqual(res3.status, 'match');
  });

  it('matches addresses with Indian city aliases and road abbreviations', () => {
    const addrA = 'Flat 101, MG Rd, Bangalore 560001';
    const addrB = 'Flat 101, MG Road, Bengaluru 560001';
    const res = compareAddresses(addrA, addrB, '560001', '560001');
    assert.strictEqual(res.status, 'match');
    assert.strictEqual(res.ruleId, 'RULE_ADDRESS_MATCH');
  });

  it('matches gender variations (M vs MALE, F vs FEMALE)', () => {
    assert.strictEqual(compareGender('M', 'Male').status, 'match');
    assert.strictEqual(compareGender('FEMALE', 'F').status, 'match');
  });

  it('matches identical PIN codes', () => {
    const res = comparePincode('110001', '110001');
    assert.strictEqual(res.status, 'match');
    assert.strictEqual(res.ruleId, 'RULE_PIN_MATCH');
  });
});

describe('3. Initials and Name Token Variations', () => {
  it('identifies initial expansion in same order (K. Suresh vs Kumar Suresh)', () => {
    const res = compareNames('K. Suresh', 'Kumar Suresh');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_NAME_INITIAL_EXPANSION');
  });

  it('identifies initial expansion in inverted order (K. Suresh vs Suresh Kumar)', () => {
    const res = compareNames('K. Suresh', 'Suresh Kumar');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_NAME_INITIAL_EXPANSION');
  });

  it('identifies initial expansion with surname prefix (Suresh K vs Suresh Kumar)', () => {
    const res = compareNames('Suresh K', 'Suresh Kumar');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_NAME_INITIAL_EXPANSION');
  });

  it('identifies word order reversal (Rajesh Kumar vs Kumar Rajesh)', () => {
    const res = compareNames('Rajesh Kumar', 'Kumar Rajesh');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_NAME_ORDER_VARIATION');
  });

  it('flags minor typo / transliteration differences for review', () => {
    const res = compareNames('Rajeshe Kumar', 'Rajesh Kumar');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_NAME_SPELLING_VARIATION');
  });

  it('flags completely dissimilar names as mismatch', () => {
    const res = compareNames('Rajesh Kumar', 'Amit Sharma');
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_NAME_MISMATCH');
  });
});

describe('4. Date of Birth (DOB) Comparisons', () => {
  it('detects day/month swap format error (05/10/1988 vs 10/05/1988)', () => {
    const res = compareDOB('05/10/1988', '10/05/1988');
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_DOB_INVERTED_FORMAT');
  });

  it('flags year-only Aadhaar record as review needed when year matches full date', () => {
    const res = compareDOB('1988', '15/08/1988');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_DOB_YEAR_ONLY');
  });

  it('flags year-only vs year-only as review needed when years match', () => {
    const res = compareDOB('1988', '1988');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_DOB_YEAR_ONLY');
  });

  it('flags year mismatch when birth years differ', () => {
    const res = compareDOB('1988', '1990');
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_DOB_YEAR_MISMATCH');
  });

  it('flags different dates in same year as date mismatch', () => {
    const res = compareDOB('15/08/1990', '20/08/1990');
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_DOB_DATE_MISMATCH');
  });

  it('flags unparsed gibberish date strings for review', () => {
    const res = compareDOB('unknown-date', '15/08/1990');
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_DOB_UNPARSED');
  });
});

describe('5. Address and Pincode Comparisons', () => {
  it('flags different PIN codes as mismatch', () => {
    const addrA = 'Sector 14, Gurgaon, Haryana 122001';
    const addrB = 'Sector 14, Gurgaon, Haryana 122002';
    const res = compareAddresses(addrA, addrB, '122001', '122002');
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_ADDRESS_PIN_MISMATCH');
  });

  it('flags moderate locality overlap without PIN mismatch as review', () => {
    const addrA = 'House 42, Green Park, New Delhi';
    const addrB = 'Flat 10, Green Park Extension, New Delhi';
    const res = compareAddresses(addrA, addrB);
    assert.strictEqual(res.status, 'review');
    assert.strictEqual(res.ruleId, 'RULE_ADDRESS_FORMAT_VARIATION');
  });

  it('flags completely unrelated addresses as mismatch', () => {
    const addrA = 'Plot 55, Banjara Hills, Hyderabad, Telangana';
    const addrB = '14 Marine Drive, Nariman Point, Mumbai, Maharashtra';
    const res = compareAddresses(addrA, addrB);
    assert.strictEqual(res.status, 'mismatch');
    assert.strictEqual(res.ruleId, 'RULE_ADDRESS_MISMATCH');
  });
});

describe('6. Master Comparison Report & Findings-Driven Checklist', () => {
  it('generates transparent status counts and findings-driven checklist', () => {
    const docA: DocumentFields = {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-1234',
      name: 'K. Suresh',
      fatherOrSpouseName: 'S/O Ramesh Kumar',
      dob: '1988',
      gender: 'MALE',
      address: 'Plot 12, Indiranagar, Bangalore 560038',
      pincode: '560038'
    };

    const docB: DocumentFields = {
      documentType: 'pan',
      documentNumber: 'ABCDE1234F',
      name: 'Suresh Kumar',
      fatherOrSpouseName: 'Ramesh Kumar',
      dob: '15/08/1988',
      gender: 'MALE',
      address: '',
      pincode: ''
    };

    const report = generateComparisonReport(docA, docB, 'passport');

    // Name: Review (initial)
    assert.strictEqual(report.fieldResults.name.status, 'review');
    // Father name: Match (Ramesh Kumar matches Ramesh Kumar after prefix stripped)
    assert.strictEqual(report.fieldResults.fatherOrSpouseName.status, 'match');
    // DOB: Review (year-only vs full date)
    assert.strictEqual(report.fieldResults.dob.status, 'review');
    // Gender: Match (MALE vs MALE)
    assert.strictEqual(report.fieldResults.gender.status, 'match');
    // Address: Not Available (missing in docB)
    assert.strictEqual(report.fieldResults.address.status, 'not_available');
    // Pincode: Not Available (missing in docB)
    assert.strictEqual(report.fieldResults.pincode.status, 'not_available');

    // Status counts:
    assert.strictEqual(report.statusCounts.match, 2);
    assert.strictEqual(report.statusCounts.review, 2);
    assert.strictEqual(report.statusCounts.mismatch, 0);
    assert.strictEqual(report.statusCounts.notAvailable, 2);

    // Checklist generated ONLY from review or mismatch findings:
    assert.ok(report.checklist.some((item) => item.field === 'Cardholder Name'));
    assert.ok(report.checklist.some((item) => item.field === 'Date of Birth (DOB)'));

    // Official service guidance is attached with valid source URL
    assert.ok(report.serviceGuidance.verifiedOfficialSourceUrl.includes('passportindia.gov.in'));
    assert.strictEqual(report.serviceGuidance.lastVerifiedDate, 'October 2026');
  });
});
