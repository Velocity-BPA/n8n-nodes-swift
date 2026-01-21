/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { BIC_DIRECTORY, COUNTRY_CODES, BicEntry } from '../../../data/bicDirectory';
import { BicValidationResult, BicLookupResult, BicSearchResult } from './types';

/**
 * BIC/SWIFT code pattern (ISO 9362)
 * Format: BBBB CC LL [XXX]
 * - BBBB: 4-letter institution code
 * - CC: 2-letter country code (ISO 3166-1)
 * - LL: 2-character location code
 * - XXX: 3-character branch code (optional, XXX for head office)
 */
const BIC_PATTERN = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/**
 * Validate a BIC/SWIFT code
 */
export function validateBic(bic: string): BicValidationResult {
  const errors: string[] = [];
  const normalized = normalizeBic(bic);

  // Check if empty
  if (!normalized) {
    return {
      valid: false,
      bic: bic,
      normalized: '',
      components: {
        institutionCode: '',
        countryCode: '',
        locationCode: '',
        branchCode: '',
      },
      errors: ['BIC code is required'],
    };
  }

  // Check length (8 or 11 characters)
  if (normalized.length !== 8 && normalized.length !== 11) {
    errors.push(`BIC must be 8 or 11 characters, got ${normalized.length}`);
  }

  // Check pattern
  if (!BIC_PATTERN.test(normalized)) {
    errors.push('BIC format is invalid. Expected format: AAAABBCCXXX or AAAABBCC');
  }

  // Extract components
  const components = {
    institutionCode: normalized.slice(0, 4),
    countryCode: normalized.slice(4, 6),
    locationCode: normalized.slice(6, 8),
    branchCode: normalized.length === 11 ? normalized.slice(8, 11) : 'XXX',
  };

  // Validate country code
  if (components.countryCode && !COUNTRY_CODES[components.countryCode]) {
    errors.push(`Unknown country code: ${components.countryCode}`);
  }

  // Check for invalid characters in location code
  if (components.locationCode) {
    const locationFirst = components.locationCode[0];
    if (locationFirst === '0' || locationFirst === '1') {
      errors.push('Location code first character cannot be 0 or 1');
    }
  }

  return {
    valid: errors.length === 0,
    bic: bic,
    normalized: normalized,
    components,
    errors,
  };
}

/**
 * Normalize a BIC code (uppercase, remove spaces)
 */
export function normalizeBic(bic: string): string {
  return bic.toUpperCase().replace(/\s/g, '');
}

/**
 * Parse BIC components
 */
export function parseBic(bic: string): BicValidationResult['components'] {
  const normalized = normalizeBic(bic);
  return {
    institutionCode: normalized.slice(0, 4),
    countryCode: normalized.slice(4, 6),
    locationCode: normalized.slice(6, 8),
    branchCode: normalized.length === 11 ? normalized.slice(8, 11) : 'XXX',
  };
}

/**
 * Look up a BIC in the directory
 */
export function lookupBic(bic: string): BicLookupResult {
  const normalized = normalizeBic(bic);
  
  // Try exact match first
  let entry = BIC_DIRECTORY.find(e => normalizeBic(e.bic) === normalized);
  
  // If not found and 11 characters, try with XXX branch
  if (!entry && normalized.length === 11) {
    const baseCode = normalized.slice(0, 8) + 'XXX';
    entry = BIC_DIRECTORY.find(e => normalizeBic(e.bic) === baseCode);
  }
  
  // If not found and 8 characters, try with XXX suffix
  if (!entry && normalized.length === 8) {
    const fullCode = normalized + 'XXX';
    entry = BIC_DIRECTORY.find(e => normalizeBic(e.bic) === fullCode);
  }

  if (entry) {
    return {
      found: true,
      bic: normalized,
      institution: entry.institution,
      branch: entry.branch,
      city: entry.city,
      country: entry.country,
      countryCode: entry.countryCode,
      address: entry.address,
      isHeadquarters: entry.isHeadquarters,
    };
  }

  return {
    found: false,
    bic: normalized,
  };
}

/**
 * Search BIC directory by various criteria
 */
export function searchBic(options: {
  query?: string;
  country?: string;
  city?: string;
  institutionName?: string;
  limit?: number;
}): BicSearchResult {
  const { query, country, city, institutionName, limit = 10 } = options;
  
  let results: BicEntry[] = [...BIC_DIRECTORY];

  // Filter by country
  if (country) {
    const countryUpper = country.toUpperCase();
    results = results.filter(e => 
      e.countryCode === countryUpper || 
      e.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  // Filter by city
  if (city) {
    const cityLower = city.toLowerCase();
    results = results.filter(e => 
      e.city.toLowerCase().includes(cityLower)
    );
  }

  // Filter by institution name
  if (institutionName) {
    const nameLower = institutionName.toLowerCase();
    results = results.filter(e => 
      e.institution.toLowerCase().includes(nameLower)
    );
  }

  // General query search (searches across all fields)
  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter(e =>
      e.bic.toLowerCase().includes(queryLower) ||
      e.institution.toLowerCase().includes(queryLower) ||
      e.city.toLowerCase().includes(queryLower) ||
      e.country.toLowerCase().includes(queryLower)
    );
  }

  const totalCount = results.length;
  const limitedResults = results.slice(0, limit);

  return {
    results: limitedResults.map(e => ({
      found: true,
      bic: e.bic,
      institution: e.institution,
      branch: e.branch,
      city: e.city,
      country: e.country,
      countryCode: e.countryCode,
      address: e.address,
      isHeadquarters: e.isHeadquarters,
    })),
    totalCount,
    query: query || institutionName || city || country || '',
  };
}

/**
 * Get the head office BIC from a branch BIC
 */
export function getHeadOfficeBic(bic: string): string {
  const normalized = normalizeBic(bic);
  if (normalized.length === 11) {
    return normalized.slice(0, 8) + 'XXX';
  }
  return normalized.length === 8 ? normalized + 'XXX' : normalized;
}

/**
 * Check if a BIC is a head office (XXX branch code)
 */
export function isHeadOfficeBic(bic: string): boolean {
  const normalized = normalizeBic(bic);
  if (normalized.length === 8) return true;
  if (normalized.length === 11) {
    return normalized.slice(8) === 'XXX';
  }
  return false;
}

/**
 * Get country name from BIC
 */
export function getCountryFromBic(bic: string): string | undefined {
  const normalized = normalizeBic(bic);
  if (normalized.length >= 6) {
    const countryCode = normalized.slice(4, 6);
    return COUNTRY_CODES[countryCode];
  }
  return undefined;
}
