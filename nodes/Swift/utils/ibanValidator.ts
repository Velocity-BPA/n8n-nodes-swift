/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IBAN_COUNTRY_SPECS, isCountrySupported, IbanCountrySpec } from '../../../data/ibanCountries';
import { IbanValidationResult, IbanParseResult, IbanGenerationInput } from './types';

/**
 * Validate an IBAN
 */
export function validateIban(iban: string): IbanValidationResult {
  const errors: string[] = [];
  const normalized = normalizeIban(iban);
  const formatted = formatIban(normalized);

  // Check if empty
  if (!normalized) {
    return {
      valid: false,
      iban: iban,
      formatted: '',
      errors: ['IBAN is required'],
    };
  }

  // Check minimum length
  if (normalized.length < 5) {
    return {
      valid: false,
      iban: iban,
      formatted: formatted,
      errors: ['IBAN is too short'],
    };
  }

  // Extract country code
  const countryCode = normalized.slice(0, 2);

  // Check country support
  if (!isCountrySupported(countryCode)) {
    errors.push(`Country code ${countryCode} is not supported`);
    return {
      valid: false,
      iban: iban,
      formatted: formatted,
      errors,
      countryCode,
    };
  }

  const spec = IBAN_COUNTRY_SPECS[countryCode];

  // Check length
  if (normalized.length !== spec.ibanLength) {
    errors.push(`IBAN length for ${countryCode} should be ${spec.ibanLength}, got ${normalized.length}`);
  }

  // Validate characters (only alphanumeric after country code)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(normalized)) {
    errors.push('IBAN contains invalid characters');
  }

  // Extract components
  const checkDigits = normalized.slice(2, 4);
  const bban = normalized.slice(4);
  const bankCode = normalized.slice(...spec.bankCodePosition);
  const branchCode = spec.branchCodePosition 
    ? normalized.slice(...spec.branchCodePosition) 
    : undefined;
  const accountNumber = normalized.slice(...spec.accountNumberPosition);

  // Validate checksum using MOD-97 algorithm
  if (!validateIbanChecksum(normalized)) {
    errors.push('IBAN checksum is invalid');
  }

  return {
    valid: errors.length === 0,
    iban: iban,
    formatted: formatted,
    errors,
    country: spec.country,
    countryCode,
    checkDigits,
    bban,
    bankCode,
    branchCode,
    accountNumber,
    isSepa: spec.sepa,
  };
}

/**
 * Parse IBAN into components
 */
export function parseIban(iban: string): IbanParseResult | null {
  const normalized = normalizeIban(iban);
  
  if (normalized.length < 5) {
    return null;
  }

  const countryCode = normalized.slice(0, 2);
  
  if (!isCountrySupported(countryCode)) {
    return null;
  }

  const spec = IBAN_COUNTRY_SPECS[countryCode];

  return {
    iban: normalized,
    formatted: formatIban(normalized),
    countryCode,
    country: spec.country,
    checkDigits: normalized.slice(2, 4),
    bban: normalized.slice(4),
    bankCode: normalized.slice(...spec.bankCodePosition),
    branchCode: spec.branchCodePosition 
      ? normalized.slice(...spec.branchCodePosition) 
      : undefined,
    accountNumber: normalized.slice(...spec.accountNumberPosition),
    isSepa: spec.sepa,
  };
}

/**
 * Generate an IBAN from components
 */
export function generateIban(input: IbanGenerationInput): IbanValidationResult {
  const { countryCode, bankCode, branchCode, accountNumber } = input;
  const errors: string[] = [];

  // Validate country
  if (!isCountrySupported(countryCode)) {
    return {
      valid: false,
      iban: '',
      formatted: '',
      errors: [`Country code ${countryCode} is not supported`],
      countryCode,
    };
  }

  const spec = IBAN_COUNTRY_SPECS[countryCode];

  // Validate bank code length
  if (bankCode.length !== spec.bankCodeLength) {
    errors.push(`Bank code should be ${spec.bankCodeLength} characters for ${countryCode}`);
  }

  // Validate branch code if required
  if (spec.branchCodeLength) {
    if (!branchCode) {
      errors.push(`Branch code is required for ${countryCode}`);
    } else if (branchCode.length !== spec.branchCodeLength) {
      errors.push(`Branch code should be ${spec.branchCodeLength} characters for ${countryCode}`);
    }
  }

  // Calculate expected BBAN length
  const bbanLength = spec.ibanLength - 4;
  let bban = bankCode + (branchCode || '') + accountNumber;
  
  // Pad account number if necessary
  if (bban.length < bbanLength) {
    const accountPadLength = bbanLength - bankCode.length - (branchCode?.length || 0);
    bban = bankCode + (branchCode || '') + accountNumber.padStart(accountPadLength, '0');
  }

  // Check BBAN length
  if (bban.length !== bbanLength) {
    errors.push(`BBAN length should be ${bbanLength}, got ${bban.length}`);
  }

  if (errors.length > 0) {
    return {
      valid: false,
      iban: '',
      formatted: '',
      errors,
      countryCode,
    };
  }

  // Calculate check digits
  const checkDigits = calculateIbanCheckDigits(countryCode, bban);
  const iban = countryCode + checkDigits + bban;

  return validateIban(iban);
}

/**
 * Format IBAN with spaces (groups of 4)
 */
export function formatIban(iban: string): string {
  const normalized = normalizeIban(iban);
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Normalize IBAN (uppercase, remove spaces and special characters)
 */
export function normalizeIban(iban: string): string {
  return iban.toUpperCase().replace(/[\s-]/g, '');
}

/**
 * Validate IBAN checksum using MOD-97 algorithm (ISO 7064)
 */
function validateIbanChecksum(iban: string): boolean {
  // Rearrange: move first 4 characters to end
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  
  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  const numeric = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return (code - 55).toString();
    }
    return char;
  }).join('');

  // Calculate MOD 97
  return mod97(numeric) === 1;
}

/**
 * Calculate check digits for IBAN
 */
function calculateIbanCheckDigits(countryCode: string, bban: string): string {
  // Create provisional IBAN with 00 as check digits
  const provisional = bban + countryCode + '00';
  
  // Convert letters to numbers
  const numeric = provisional.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return (code - 55).toString();
    }
    return char;
  }).join('');

  // Calculate check digits: 98 - (numeric MOD 97)
  const checkDigits = 98 - mod97(numeric);
  return checkDigits.toString().padStart(2, '0');
}

/**
 * Calculate MOD 97 for large numbers (as string)
 */
function mod97(numStr: string): number {
  let remainder = 0;
  for (const digit of numStr) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }
  return remainder;
}

/**
 * Check if IBAN is from a SEPA country
 */
export function isSepaIban(iban: string): boolean {
  const normalized = normalizeIban(iban);
  if (normalized.length < 2) return false;
  
  const countryCode = normalized.slice(0, 2);
  const spec = IBAN_COUNTRY_SPECS[countryCode];
  return spec?.sepa ?? false;
}

/**
 * Get IBAN specification for a country
 */
export function getIbanSpec(countryCode: string): IbanCountrySpec | undefined {
  return IBAN_COUNTRY_SPECS[countryCode.toUpperCase()];
}

/**
 * Get example IBAN for a country
 */
export function getExampleIban(countryCode: string): string | undefined {
  const spec = IBAN_COUNTRY_SPECS[countryCode.toUpperCase()];
  return spec?.example;
}
