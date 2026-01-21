/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IbanCountrySpec {
  countryCode: string;
  country: string;
  ibanLength: number;
  bankCodeLength: number;
  bankCodePosition: [number, number];
  accountNumberPosition: [number, number];
  branchCodeLength?: number;
  branchCodePosition?: [number, number];
  checkDigitsPosition: [number, number];
  example: string;
  sepa: boolean;
}

/**
 * IBAN specifications by country.
 * Based on ISO 13616 and SWIFT IBAN Registry.
 */
export const IBAN_COUNTRY_SPECS: Record<string, IbanCountrySpec> = {
  // Western Europe
  DE: {
    countryCode: 'DE',
    country: 'Germany',
    ibanLength: 22,
    bankCodeLength: 8,
    bankCodePosition: [4, 12],
    accountNumberPosition: [12, 22],
    checkDigitsPosition: [2, 4],
    example: 'DE89370400440532013000',
    sepa: true,
  },
  FR: {
    countryCode: 'FR',
    country: 'France',
    ibanLength: 27,
    bankCodeLength: 5,
    bankCodePosition: [4, 9],
    branchCodeLength: 5,
    branchCodePosition: [9, 14],
    accountNumberPosition: [14, 25],
    checkDigitsPosition: [2, 4],
    example: 'FR1420041010050500013M02606',
    sepa: true,
  },
  GB: {
    countryCode: 'GB',
    country: 'United Kingdom',
    ibanLength: 22,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    branchCodeLength: 6,
    branchCodePosition: [8, 14],
    accountNumberPosition: [14, 22],
    checkDigitsPosition: [2, 4],
    example: 'GB29NWBK60161331926819',
    sepa: true,
  },
  ES: {
    countryCode: 'ES',
    country: 'Spain',
    ibanLength: 24,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    branchCodeLength: 4,
    branchCodePosition: [8, 12],
    accountNumberPosition: [14, 24],
    checkDigitsPosition: [2, 4],
    example: 'ES9121000418450200051332',
    sepa: true,
  },
  IT: {
    countryCode: 'IT',
    country: 'Italy',
    ibanLength: 27,
    bankCodeLength: 5,
    bankCodePosition: [5, 10],
    branchCodeLength: 5,
    branchCodePosition: [10, 15],
    accountNumberPosition: [15, 27],
    checkDigitsPosition: [2, 4],
    example: 'IT60X0542811101000000123456',
    sepa: true,
  },
  NL: {
    countryCode: 'NL',
    country: 'Netherlands',
    ibanLength: 18,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 18],
    checkDigitsPosition: [2, 4],
    example: 'NL91ABNA0417164300',
    sepa: true,
  },
  BE: {
    countryCode: 'BE',
    country: 'Belgium',
    ibanLength: 16,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    accountNumberPosition: [7, 14],
    checkDigitsPosition: [2, 4],
    example: 'BE68539007547034',
    sepa: true,
  },
  AT: {
    countryCode: 'AT',
    country: 'Austria',
    ibanLength: 20,
    bankCodeLength: 5,
    bankCodePosition: [4, 9],
    accountNumberPosition: [9, 20],
    checkDigitsPosition: [2, 4],
    example: 'AT611904300234573201',
    sepa: true,
  },
  CH: {
    countryCode: 'CH',
    country: 'Switzerland',
    ibanLength: 21,
    bankCodeLength: 5,
    bankCodePosition: [4, 9],
    accountNumberPosition: [9, 21],
    checkDigitsPosition: [2, 4],
    example: 'CH9300762011623852957',
    sepa: true,
  },
  PT: {
    countryCode: 'PT',
    country: 'Portugal',
    ibanLength: 25,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    branchCodeLength: 4,
    branchCodePosition: [8, 12],
    accountNumberPosition: [12, 23],
    checkDigitsPosition: [2, 4],
    example: 'PT50000201231234567890154',
    sepa: true,
  },
  IE: {
    countryCode: 'IE',
    country: 'Ireland',
    ibanLength: 22,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    branchCodeLength: 6,
    branchCodePosition: [8, 14],
    accountNumberPosition: [14, 22],
    checkDigitsPosition: [2, 4],
    example: 'IE29AIBK93115212345678',
    sepa: true,
  },
  LU: {
    countryCode: 'LU',
    country: 'Luxembourg',
    ibanLength: 20,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    accountNumberPosition: [7, 20],
    checkDigitsPosition: [2, 4],
    example: 'LU280019400644750000',
    sepa: true,
  },

  // Nordic Countries
  SE: {
    countryCode: 'SE',
    country: 'Sweden',
    ibanLength: 24,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    accountNumberPosition: [7, 24],
    checkDigitsPosition: [2, 4],
    example: 'SE4550000000058398257466',
    sepa: true,
  },
  NO: {
    countryCode: 'NO',
    country: 'Norway',
    ibanLength: 15,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 15],
    checkDigitsPosition: [2, 4],
    example: 'NO9386011117947',
    sepa: true,
  },
  DK: {
    countryCode: 'DK',
    country: 'Denmark',
    ibanLength: 18,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 18],
    checkDigitsPosition: [2, 4],
    example: 'DK5000400440116243',
    sepa: true,
  },
  FI: {
    countryCode: 'FI',
    country: 'Finland',
    ibanLength: 18,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    accountNumberPosition: [7, 18],
    checkDigitsPosition: [2, 4],
    example: 'FI2112345600000785',
    sepa: true,
  },

  // Eastern Europe
  PL: {
    countryCode: 'PL',
    country: 'Poland',
    ibanLength: 28,
    bankCodeLength: 8,
    bankCodePosition: [4, 12],
    accountNumberPosition: [12, 28],
    checkDigitsPosition: [2, 4],
    example: 'PL61109010140000071219812874',
    sepa: true,
  },
  CZ: {
    countryCode: 'CZ',
    country: 'Czech Republic',
    ibanLength: 24,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 24],
    checkDigitsPosition: [2, 4],
    example: 'CZ6508000000192000145399',
    sepa: true,
  },
  HU: {
    countryCode: 'HU',
    country: 'Hungary',
    ibanLength: 28,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    branchCodeLength: 4,
    branchCodePosition: [7, 11],
    accountNumberPosition: [12, 28],
    checkDigitsPosition: [2, 4],
    example: 'HU42117730161111101800000000',
    sepa: true,
  },
  RO: {
    countryCode: 'RO',
    country: 'Romania',
    ibanLength: 24,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 24],
    checkDigitsPosition: [2, 4],
    example: 'RO49AAAA1B31007593840000',
    sepa: true,
  },
  SK: {
    countryCode: 'SK',
    country: 'Slovakia',
    ibanLength: 24,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 24],
    checkDigitsPosition: [2, 4],
    example: 'SK3112000000198742637541',
    sepa: true,
  },
  BG: {
    countryCode: 'BG',
    country: 'Bulgaria',
    ibanLength: 22,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    branchCodeLength: 4,
    branchCodePosition: [8, 12],
    accountNumberPosition: [14, 22],
    checkDigitsPosition: [2, 4],
    example: 'BG80BNBG96611020345678',
    sepa: true,
  },
  HR: {
    countryCode: 'HR',
    country: 'Croatia',
    ibanLength: 21,
    bankCodeLength: 7,
    bankCodePosition: [4, 11],
    accountNumberPosition: [11, 21],
    checkDigitsPosition: [2, 4],
    example: 'HR1210010051863000160',
    sepa: true,
  },

  // Middle East
  AE: {
    countryCode: 'AE',
    country: 'United Arab Emirates',
    ibanLength: 23,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    accountNumberPosition: [7, 23],
    checkDigitsPosition: [2, 4],
    example: 'AE070331234567890123456',
    sepa: false,
  },
  SA: {
    countryCode: 'SA',
    country: 'Saudi Arabia',
    ibanLength: 24,
    bankCodeLength: 2,
    bankCodePosition: [4, 6],
    accountNumberPosition: [6, 24],
    checkDigitsPosition: [2, 4],
    example: 'SA0380000000608010167519',
    sepa: false,
  },
  QA: {
    countryCode: 'QA',
    country: 'Qatar',
    ibanLength: 29,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 29],
    checkDigitsPosition: [2, 4],
    example: 'QA58DOHB00001234567890ABCDEFG',
    sepa: false,
  },
  KW: {
    countryCode: 'KW',
    country: 'Kuwait',
    ibanLength: 30,
    bankCodeLength: 4,
    bankCodePosition: [4, 8],
    accountNumberPosition: [8, 30],
    checkDigitsPosition: [2, 4],
    example: 'KW81CBKU0000000000001234560101',
    sepa: false,
  },
  IL: {
    countryCode: 'IL',
    country: 'Israel',
    ibanLength: 23,
    bankCodeLength: 3,
    bankCodePosition: [4, 7],
    branchCodeLength: 3,
    branchCodePosition: [7, 10],
    accountNumberPosition: [10, 23],
    checkDigitsPosition: [2, 4],
    example: 'IL620108000000099999999',
    sepa: false,
  },

  // Other regions
  BR: {
    countryCode: 'BR',
    country: 'Brazil',
    ibanLength: 29,
    bankCodeLength: 8,
    bankCodePosition: [4, 12],
    branchCodeLength: 5,
    branchCodePosition: [12, 17],
    accountNumberPosition: [17, 29],
    checkDigitsPosition: [2, 4],
    example: 'BR9700360305000010009795493P1',
    sepa: false,
  },
};

/**
 * Get all supported country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(IBAN_COUNTRY_SPECS);
}

/**
 * Check if a country code is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in IBAN_COUNTRY_SPECS;
}

/**
 * Get SEPA countries
 */
export function getSepaCountries(): string[] {
  return Object.entries(IBAN_COUNTRY_SPECS)
    .filter(([_, spec]) => spec.sepa)
    .map(([code]) => code);
}
