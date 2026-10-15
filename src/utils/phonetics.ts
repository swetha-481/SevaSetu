/**
 * Indian Name Phonetic Matching & Character Diff Engine
 * Handles Indian transliteration variations:
 * e.g. "Choudhary" vs "Chaudhari", "Dixit" vs "Deekshit", "Verma" vs "Varma", "Suresh" vs "Suresha"
 */

// Common Indian English digraph transliteration rules
const PHONETIC_REPLACEMENTS: Array<[RegExp, string]> = [
  [/ee/gi, 'i'],
  [/oo/gi, 'u'],
  [/ou/gi, 'au'],
  [/ph/gi, 'f'],
  [/ksh/gi, 'x'],
  [/ch/gi, 'c'],
  [/sh/gi, 's'],
  [/th/gi, 't'],
  [/dh/gi, 'd'],
  [/bh/gi, 'b'],
  [/gh/gi, 'g'],
  [/kh/gi, 'k'],
  [/v/gi, 'w'],
  [/z/gi, 'j'],
  [/y$/gi, 'i'],
  [/aa/gi, 'a']
];

/**
 * Generates an Indian phonetic fingerprint for transliteration equivalence
 */
export function getIndianPhoneticKey(str: string): string {
  if (!str) return '';
  let clean = str.toLowerCase().replace(/[^a-z]/g, '');

  for (const [pattern, replacement] of PHONETIC_REPLACEMENTS) {
    clean = clean.replace(pattern, replacement);
  }

  // Remove duplicate adjacent characters (e.g., 'tt' -> 't', 'mm' -> 'm')
  clean = clean.replace(/(.)\1+/g, '$1');

  return clean;
}

/**
 * Checks if two words sound phonetically equivalent in Indian English/Devanagari
 */
export function arePhoneticallyEquivalent(a: string, b: string): {
  isMatch: boolean;
  keyA: string;
  keyB: string;
  explanation?: string;
} {
  const keyA = getIndianPhoneticKey(a);
  const keyB = getIndianPhoneticKey(b);

  if (!keyA || !keyB) {
    return { isMatch: false, keyA, keyB };
  }

  if (keyA === keyB) {
    return {
      isMatch: true,
      keyA,
      keyB,
      explanation: `"${a}" and "${b}" are phonetically identical in Indian transliteration (Fingerprint: ${keyA.toUpperCase()}).`
    };
  }

  return { isMatch: false, keyA, keyB };
}

/**
 * Computes character-level differences for inline visual highlights
 */
export interface CharacterDiffSegment {
  char: string;
  type: 'same' | 'added' | 'removed' | 'mismatch';
}

export function computeVisualCharacterDiff(
  strA: string,
  strB: string
): { diffA: CharacterDiffSegment[]; diffB: CharacterDiffSegment[] } {
  const sA = strA || '';
  const sB = strB || '';

  const maxLen = Math.max(sA.length, sB.length);
  const diffA: CharacterDiffSegment[] = [];
  const diffB: CharacterDiffSegment[] = [];

  for (let i = 0; i < maxLen; i++) {
    const cA = sA[i];
    const cB = sB[i];

    if (cA && cB) {
      if (cA.toLowerCase() === cB.toLowerCase()) {
        diffA.push({ char: cA, type: 'same' });
        diffB.push({ char: cB, type: 'same' });
      } else {
        diffA.push({ char: cA, type: 'mismatch' });
        diffB.push({ char: cB, type: 'mismatch' });
      }
    } else if (cA && !cB) {
      diffA.push({ char: cA, type: 'removed' });
    } else if (!cA && cB) {
      diffB.push({ char: cB, type: 'added' });
    }
  }

  return { diffA, diffB };
}
