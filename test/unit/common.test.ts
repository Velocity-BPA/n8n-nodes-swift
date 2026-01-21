/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	formatSwiftAmount,
	parseSwiftAmount,
	formatSwiftDate,
	parseSwiftDate,
	generateReference,
	sanitizeForSwift,
	formatDate,
} from '../../nodes/Swift/utils/common';

describe('Common Utilities', () => {
	describe('formatSwiftAmount', () => {
		it('should format whole numbers', () => {
			const result = formatSwiftAmount(1000);
			expect(result).toBe('1000,00');
		});

		it('should format decimals correctly', () => {
			const result = formatSwiftAmount(1234.56);
			expect(result).toBe('1234,56');
		});

		it('should handle small decimals', () => {
			const result = formatSwiftAmount(0.01);
			expect(result).toBe('0,01');
		});

		it('should handle large amounts', () => {
			const result = formatSwiftAmount(1000000.99);
			expect(result).toBe('1000000,99');
		});

		it('should round to 2 decimal places', () => {
			const result = formatSwiftAmount(123.456);
			expect(result).toBe('123,46');
		});

		it('should handle zero', () => {
			const result = formatSwiftAmount(0);
			expect(result).toBe('0,00');
		});
	});

	describe('parseSwiftAmount', () => {
		it('should parse SWIFT formatted amount', () => {
			const result = parseSwiftAmount('1000,00');
			expect(result).toBe(1000);
		});

		it('should parse amount with decimals', () => {
			const result = parseSwiftAmount('1234,56');
			expect(result).toBe(1234.56);
		});

		it('should handle amount without decimals', () => {
			const result = parseSwiftAmount('1000');
			expect(result).toBe(1000);
		});

		it('should handle period as decimal separator', () => {
			const result = parseSwiftAmount('1234.56');
			expect(result).toBe(1234.56);
		});
	});

	describe('formatSwiftDate', () => {
		it('should format date as YYMMDD', () => {
			const date = new Date('2024-03-15');
			const result = formatSwiftDate(date);
			expect(result).toBe('240315');
		});

		it('should handle single digit months and days', () => {
			const date = new Date('2024-01-05');
			const result = formatSwiftDate(date);
			expect(result).toBe('240105');
		});

		it('should handle string date input', () => {
			const result = formatSwiftDate('2024-03-15');
			expect(result).toBe('240315');
		});
	});

	describe('formatDate', () => {
		it('should format date as YYMMDD with swift format', () => {
			const date = new Date('2024-03-15');
			const result = formatDate(date, { format: 'swift' });
			expect(result).toBe('240315');
		});

		it('should format date as YYYYMMDD', () => {
			const date = new Date('2024-03-15');
			const result = formatDate(date, { format: 'yyyymmdd' });
			expect(result).toBe('20240315');
		});

		it('should format date as ISO', () => {
			const date = new Date('2024-03-15T00:00:00.000Z');
			const result = formatDate(date, { format: 'iso' });
			expect(result).toContain('2024-03-15');
		});
	});

	describe('parseSwiftDate', () => {
		it('should parse YYMMDD format', () => {
			const result = parseSwiftDate('240315');
			expect(result.getFullYear()).toBe(2024);
			expect(result.getMonth()).toBe(2); // March is 2 (0-indexed)
			expect(result.getDate()).toBe(15);
		});

		it('should handle Y2K dates correctly for 19xx', () => {
			const result = parseSwiftDate('990115');
			expect(result.getFullYear()).toBe(1999);
		});

		it('should handle Y2K dates correctly for 20xx', () => {
			const result = parseSwiftDate('240115');
			expect(result.getFullYear()).toBe(2024);
		});
	});

	describe('generateReference', () => {
		it('should generate a message reference', () => {
			const result = generateReference({ type: 'message' });
			expect(result).toBeDefined();
			expect(result.length).toBe(16);
		});

		it('should include prefix when provided', () => {
			const result = generateReference({ type: 'message', prefix: 'TXN' });
			expect(result.startsWith('TXN')).toBe(true);
		});

		it('should generate unique references', () => {
			const ref1 = generateReference({ type: 'message' });
			const ref2 = generateReference({ type: 'message' });
			expect(ref1).not.toBe(ref2);
		});

		it('should generate UETR format reference', () => {
			const result = generateReference({ type: 'uetr' });
			expect(result).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
		});

		it('should generate transaction reference', () => {
			const result = generateReference({ type: 'transaction', prefix: 'TX' });
			expect(result.startsWith('TX')).toBe(true);
			expect(result.length).toBeLessThanOrEqual(35);
		});
	});

	describe('sanitizeForSwift', () => {
		it('should preserve valid SWIFT characters', () => {
			const result = sanitizeForSwift('Hello World');
			expect(result).toBe('Hello World');
		});

		it('should replace special characters with spaces', () => {
			const result = sanitizeForSwift('Hello@World#123');
			expect(result).not.toContain('@');
			expect(result).not.toContain('#');
		});

		it('should preserve allowed SWIFT characters', () => {
			const result = sanitizeForSwift('ABCD-1234/TEST');
			expect(result).toContain('ABCD');
			expect(result).toContain('1234');
			expect(result).toContain('TEST');
		});

		it('should handle empty string', () => {
			const result = sanitizeForSwift('');
			expect(result).toBe('');
		});

		it('should preserve numbers', () => {
			const result = sanitizeForSwift('Account12345');
			expect(result).toContain('12345');
		});

		it('should collapse multiple spaces', () => {
			const result = sanitizeForSwift('Hello   World');
			expect(result).toBe('Hello World');
		});
	});
});
