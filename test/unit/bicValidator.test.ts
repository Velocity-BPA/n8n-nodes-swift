/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { validateBic, lookupBic, searchBic, parseBic, normalizeBic } from '../../nodes/Swift/utils/bicValidator';

describe('BIC Validator', () => {
	describe('validateBic', () => {
		it('should validate a correct 8-character BIC', () => {
			const result = validateBic('CHASUS33');
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should validate a correct 11-character BIC', () => {
			const result = validateBic('CHASUS33XXX');
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject BIC with invalid length', () => {
			const result = validateBic('CHAS');
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('8 or 11'))).toBe(true);
		});

		it('should reject BIC with invalid characters', () => {
			const result = validateBic('CHAS1S33');
			expect(result.valid).toBe(false);
		});

		it('should handle lowercase input', () => {
			const result = validateBic('chasus33');
			expect(result.valid).toBe(true);
		});

		it('should reject empty input', () => {
			const result = validateBic('');
			expect(result.valid).toBe(false);
		});
	});

	describe('lookupBic', () => {
		it('should find a known BIC', () => {
			const result = lookupBic('CHASUS33XXX');
			expect(result.found).toBe(true);
			expect(result.institution).toContain('Chase');
		});

		it('should return found=false for unknown BIC', () => {
			const result = lookupBic('UNKNOWNBIC');
			expect(result.found).toBe(false);
		});

		it('should match 8-char BIC to 11-char entry', () => {
			const result = lookupBic('CHASUS33');
			expect(result.found).toBe(true);
		});
	});

	describe('searchBic', () => {
		it('should find BICs by institution name', () => {
			const searchResult = searchBic({ query: 'Chase' });
			expect(searchResult.results.length).toBeGreaterThan(0);
		});

		it('should filter by country code', () => {
			const searchResult = searchBic({ country: 'DE' });
			searchResult.results.forEach(r => {
				expect(r.countryCode).toBe('DE');
			});
		});

		it('should return empty array for no matches', () => {
			const searchResult = searchBic({ query: 'XYZNONEXISTENT' });
			expect(searchResult.results).toHaveLength(0);
		});

		it('should limit results', () => {
			const searchResult = searchBic({ limit: 5 });
			expect(searchResult.results.length).toBeLessThanOrEqual(5);
		});
	});

	describe('parseBic', () => {
		it('should parse BIC components correctly', () => {
			const result = parseBic('DEUTDEFFXXX');
			expect(result.institutionCode).toBe('DEUT');
			expect(result.countryCode).toBe('DE');
			expect(result.locationCode).toBe('FF');
			expect(result.branchCode).toBe('XXX');
		});

		it('should handle 8-character BIC', () => {
			const result = parseBic('DEUTDEFF');
			expect(result.branchCode).toBe('XXX');
		});
	});

	describe('normalizeBic', () => {
		it('should uppercase lowercase BIC', () => {
			const result = normalizeBic('chasus33xxx');
			expect(result).toBe('CHASUS33XXX');
		});

		it('should remove spaces', () => {
			const result = normalizeBic('CHAS US33 XXX');
			expect(result).toBe('CHASUS33XXX');
		});

		it('should keep valid BIC unchanged', () => {
			const result = normalizeBic('CHASUS33XXX');
			expect(result).toBe('CHASUS33XXX');
		});
	});
});
