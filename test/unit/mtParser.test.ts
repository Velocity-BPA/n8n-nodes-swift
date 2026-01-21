/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { parseMtMessage, validateMtMessage } from '../../nodes/Swift/utils/mtParser';

describe('MT Parser', () => {
	const sampleMT103 = `{1:F01CHABORPLAXXX0000000000}{2:O1031230210315CHAABORPLAXXX00000000002103151230N}{4:
:20:REFERENCE123
:23B:CRED
:32A:210315USD1000,00
:50K:/12345678
JOHN DOE
123 MAIN STREET
:59:/98765432
JANE SMITH
456 OAK AVENUE
:71A:SHA
-}`;

	const sampleMT940 = `{1:F01CHABORPLAXXX0000000000}{2:O9401230210315CHAABORPLAXXX00000000002103151230N}{4:
:20:STMT123
:25:12345678
:28C:1/1
:60F:C210315USD10000,00
:62F:C210315USD10500,00
-}`;

	describe('parseMtMessage', () => {
		it('should parse MT103 message blocks', () => {
			const result = parseMtMessage(sampleMT103);
			expect(result.basicHeader).toBeDefined();
			expect(result.applicationHeader).toBeDefined();
			expect(result.textBlock).toBeDefined();
		});

		it('should extract message type from block 2', () => {
			const result = parseMtMessage(sampleMT103);
			expect(result.messageType).toBe('MT103');
		});

		it('should parse field 20 (transaction reference)', () => {
			const result = parseMtMessage(sampleMT103);
			expect(result.textBlock['20']).toBe('REFERENCE123');
		});

		it('should parse field 32A (value date/currency/amount)', () => {
			const result = parseMtMessage(sampleMT103);
			const field32A = result.textBlock['32A'];
			const value = Array.isArray(field32A) ? field32A[0] : field32A;
			expect(value).toContain('210315');
			expect(value).toContain('USD');
			expect(value).toContain('1000,00');
		});

		it('should parse MT940 statement message', () => {
			const result = parseMtMessage(sampleMT940);
			expect(result.messageType).toBe('MT940');
			expect(result.textBlock['25']).toBe('12345678');
		});

		it('should handle message without block 4 terminator', () => {
			const msgWithoutTerminator = `{1:F01TESTXXXX0000000000}{2:O1031230210315TESTXXXX00000000002103151230N}{4:
:20:REF123
:32A:210315USD100,00
}`;
			const result = parseMtMessage(msgWithoutTerminator);
			expect(result.textBlock['20']).toBe('REF123');
		});

		it('should parse basic header components', () => {
			const result = parseMtMessage(sampleMT103);
			expect(result.basicHeader.applicationId).toBe('F');
			expect(result.basicHeader.serviceId).toBe('01');
		});

		it('should parse application header', () => {
			const result = parseMtMessage(sampleMT103);
			expect(result.applicationHeader.inputOutput).toBe('O');
			expect(result.applicationHeader.messageType).toBe('MT103');
		});
	});

	describe('validateMtMessage', () => {
		it('should validate a correct MT103', () => {
			const result = validateMtMessage(sampleMT103);
			expect(result.valid).toBe(true);
		});

		it('should validate a correct MT940', () => {
			const result = validateMtMessage(sampleMT940);
			expect(result.valid).toBe(true);
		});

		it('should fail validation for missing mandatory fields', () => {
			const invalidMsg = `{1:F01TESTXXXX0000000000}{2:O1031230210315TESTXXXX00000000002103151230N}{4:
:23B:CRED
-}`;
			const result = validateMtMessage(invalidMsg);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should fail validation for invalid message format', () => {
			const result = validateMtMessage('not a valid mt message');
			expect(result.valid).toBe(false);
		});

		it('should return parsed fields in result', () => {
			const result = validateMtMessage(sampleMT103);
			expect(result.parsedFields).toBeDefined();
			expect(result.parsedFields?.['20']).toBe('REFERENCE123');
		});
	});
});
