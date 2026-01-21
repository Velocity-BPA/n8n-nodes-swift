/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { validateIban, parseIban, generateIban, formatIban } from '../../nodes/Swift/utils/ibanValidator';

describe('IBAN Validator', () => {
	describe('validateIban', () => {
		it('should validate a correct German IBAN', () => {
			const result = validateIban('DE89370400440532013000');
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should validate a correct French IBAN', () => {
			const result = validateIban('FR1420041010050500013M02606');
			expect(result.valid).toBe(true);
		});

		it('should validate a correct UK IBAN', () => {
			const result = validateIban('GB29NWBK60161331926819');
			expect(result.valid).toBe(true);
		});

		it('should reject IBAN with invalid checksum', () => {
			const result = validateIban('DE89370400440532013001');
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.toLowerCase().includes('checksum'))).toBe(true);
		});

		it('should reject IBAN with invalid country code', () => {
			const result = validateIban('XX89370400440532013000');
			expect(result.valid).toBe(false);
		});

		it('should reject IBAN with wrong length for country', () => {
			const result = validateIban('DE8937040044053201300');
			expect(result.valid).toBe(false);
		});

		it('should handle IBANs with spaces', () => {
			const result = validateIban('DE89 3704 0044 0532 0130 00');
			expect(result.valid).toBe(true);
		});

		it('should handle lowercase input', () => {
			const result = validateIban('de89370400440532013000');
			expect(result.valid).toBe(true);
		});

		it('should reject empty input', () => {
			const result = validateIban('');
			expect(result.valid).toBe(false);
		});
	});

	describe('parseIban', () => {
		it('should parse German IBAN correctly', () => {
			const result = parseIban('DE89370400440532013000');
			expect(result).not.toBeNull();
			expect(result!.countryCode).toBe('DE');
			expect(result!.checkDigits).toBe('89');
			expect(result!.bban).toBe('370400440532013000');
		});

		it('should parse UK IBAN correctly', () => {
			const result = parseIban('GB29NWBK60161331926819');
			expect(result).not.toBeNull();
			expect(result!.countryCode).toBe('GB');
			expect(result!.checkDigits).toBe('29');
			expect(result!.bankCode).toBe('NWBK');
		});

		it('should identify SEPA countries', () => {
			const deResult = parseIban('DE89370400440532013000');
			expect(deResult).not.toBeNull();
			expect(deResult!.isSepa).toBe(true);
		});

		it('should return null for invalid IBAN', () => {
			const result = parseIban('XX');
			expect(result).toBeNull();
		});
	});

	describe('generateIban', () => {
		it('should generate valid German IBAN', () => {
			const result = generateIban({
				countryCode: 'DE',
				bankCode: '37040044',
				accountNumber: '0532013000',
			});
			expect(result.valid).toBe(true);
			expect(result.iban).toMatch(/^DE\d{2}370400440532013000$/);
		});

		it('should reject invalid country code', () => {
			const result = generateIban({
				countryCode: 'XX',
				bankCode: '12345678',
				accountNumber: '0000000000',
			});
			expect(result.valid).toBe(false);
		});

		it('should generate valid UK IBAN with branch code', () => {
			const result = generateIban({
				countryCode: 'GB',
				bankCode: 'NWBK',
				branchCode: '601613',
				accountNumber: '31926819',
			});
			expect(result.valid).toBe(true);
			expect(result.iban).toContain('NWBK');
		});
	});

	describe('formatIban', () => {
		it('should format IBAN in groups of 4', () => {
			const result = formatIban('DE89370400440532013000');
			expect(result).toBe('DE89 3704 0044 0532 0130 00');
		});

		it('should handle already formatted IBAN', () => {
			const result = formatIban('DE89 3704 0044 0532 0130 00');
			expect(result).toBe('DE89 3704 0044 0532 0130 00');
		});

		it('should handle lowercase input', () => {
			const result = formatIban('de89370400440532013000');
			expect(result).toBe('DE89 3704 0044 0532 0130 00');
		});
	});
});
