/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ParsedMtMessage, MtValidationResult, ValidationError, ValidationWarning } from './types';
import { MT_SPECS, MtFieldSpec } from '../../../data/mtTemplates';

/**
 * Parse a raw MT message into structured format
 */
export function parseMtMessage(rawMessage: string): ParsedMtMessage {
  const cleaned = rawMessage.trim();
  
  // Initialize result
  const result: ParsedMtMessage = {
    messageType: '',
    basicHeader: {
      applicationId: '',
      serviceId: '',
      ltAddress: '',
      sessionNumber: '',
      sequenceNumber: '',
    },
    applicationHeader: {
      inputOutput: '',
      messageType: '',
    },
    textBlock: {},
    rawMessage: cleaned,
  };

  // Parse blocks
  const blocks = extractBlocks(cleaned);

  // Parse Block 1 (Basic Header)
  if (blocks[1]) {
    result.basicHeader = parseBasicHeader(blocks[1]);
  }

  // Parse Block 2 (Application Header)
  if (blocks[2]) {
    result.applicationHeader = parseApplicationHeader(blocks[2]);
    result.messageType = result.applicationHeader.messageType;
  }

  // Parse Block 3 (User Header) - optional
  if (blocks[3]) {
    result.userHeader = parseUserHeader(blocks[3]);
  }

  // Parse Block 4 (Text Block)
  if (blocks[4]) {
    result.textBlock = parseTextBlock(blocks[4]);
  }

  // Parse Block 5 (Trailers) - optional
  if (blocks[5]) {
    result.trailers = parseTrailers(blocks[5]);
  }

  return result;
}

/**
 * Extract message blocks from raw message
 */
function extractBlocks(message: string): Record<number, string> {
  const blocks: Record<number, string> = {};
  
  // Pattern to match {n:content}
  const blockPattern = /\{(\d):([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match;

  while ((match = blockPattern.exec(message)) !== null) {
    const blockNum = parseInt(match[1], 10);
    blocks[blockNum] = match[2];
  }

  // Alternative: if no blocks found, try line-based parsing
  if (Object.keys(blocks).length === 0) {
    // Try to parse as a simple text block
    const lines = message.split(/\r?\n/);
    const textFields: Record<string, string[]> = {};
    let currentTag = '';
    let currentValue: string[] = [];

    for (const line of lines) {
      const tagMatch = line.match(/^:(\d{2}[A-Z]?):(.*)$/);
      if (tagMatch) {
        if (currentTag) {
          textFields[currentTag] = currentValue;
        }
        currentTag = tagMatch[1];
        currentValue = [tagMatch[2]];
      } else if (currentTag && line.trim()) {
        currentValue.push(line);
      }
    }

    if (currentTag) {
      textFields[currentTag] = currentValue;
    }

    // Store as text block
    blocks[4] = message;
  }

  return blocks;
}

/**
 * Parse Basic Header (Block 1)
 */
function parseBasicHeader(block: string): ParsedMtMessage['basicHeader'] {
  // Format: {1:F01BANKBEBBAXXX0000000000}
  // F = Application ID
  // 01 = Service ID
  // BANKBEBBAXXX = LT Address (12 chars)
  // 0000 = Session Number
  // 000000 = Sequence Number
  
  return {
    applicationId: block.charAt(0) || '',
    serviceId: block.slice(1, 3) || '',
    ltAddress: block.slice(3, 15) || '',
    sessionNumber: block.slice(15, 19) || '',
    sequenceNumber: block.slice(19, 25) || '',
  };
}

/**
 * Parse Application Header (Block 2)
 */
function parseApplicationHeader(block: string): ParsedMtMessage['applicationHeader'] {
  const result: ParsedMtMessage['applicationHeader'] = {
    inputOutput: '',
    messageType: '',
  };

  if (!block) return result;

  // Input message: {2:I103BANKDEFFXXXXN}
  // Output message: {2:O1030919010101BANKBEBBAXXX00000000000101010919N}
  
  result.inputOutput = block.charAt(0);
  
  if (result.inputOutput === 'I') {
    // Input format: I + MT type (3) + receiver BIC (12) + priority + delivery
    result.messageType = 'MT' + block.slice(1, 4);
    result.receiverAddress = block.slice(4, 16);
    result.priority = block.charAt(16);
    result.deliveryMonitor = block.charAt(17);
    result.obsolescencePeriod = block.slice(18, 21);
  } else if (result.inputOutput === 'O') {
    // Output format: O + MT type (3) + input time (4) + input date (6) + MIR (28) + output date (6) + output time (4) + priority
    result.messageType = 'MT' + block.slice(1, 4);
    result.inputTime = block.slice(4, 8);
    result.inputDate = block.slice(8, 14);
    result.mir = block.slice(14, 42);
    result.outputDate = block.slice(42, 48);
    result.outputTime = block.slice(48, 52);
    result.priority = block.charAt(52);
  }

  return result;
}

/**
 * Parse User Header (Block 3)
 */
function parseUserHeader(block: string): Record<string, string> {
  const header: Record<string, string> = {};
  
  // Format: {108:MUR123456789}{121:UUID...}
  const fieldPattern = /\{(\d{3}):([^}]*)\}/g;
  let match;

  while ((match = fieldPattern.exec(block)) !== null) {
    header[match[1]] = match[2];
  }

  return header;
}

/**
 * Parse Text Block (Block 4)
 */
function parseTextBlock(block: string): Record<string, string | string[]> {
  const fields: Record<string, string | string[]> = {};
  
  // Remove leading/trailing newlines and carriage returns
  const cleanBlock = block.replace(/^[\r\n]+|[\r\n]+$/g, '');
  
  // Split by field tags
  const lines = cleanBlock.split(/\r?\n/);
  let currentTag = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    // Match field tag at start of line: :20:, :32A:, :50K:, etc.
    const tagMatch = line.match(/^:(\d{2}[A-Z]?):(.*)$/);
    
    if (tagMatch) {
      // Save previous field
      if (currentTag) {
        const value = currentLines.join('\n');
        fields[currentTag] = currentLines.length > 1 ? currentLines : value;
      }
      
      currentTag = tagMatch[1];
      currentLines = tagMatch[2] ? [tagMatch[2]] : [];
    } else if (currentTag && line !== '-') {
      // Continuation line (not the block separator)
      currentLines.push(line);
    }
  }

  // Save last field
  if (currentTag) {
    const value = currentLines.join('\n');
    fields[currentTag] = currentLines.length > 1 ? currentLines : value;
  }

  return fields;
}

/**
 * Parse Trailers (Block 5)
 */
function parseTrailers(block: string): Record<string, string> {
  const trailers: Record<string, string> = {};
  
  // Format: {CHK:ABCDEF123456}{TNG:}
  const trailerPattern = /\{([A-Z]{3}):([^}]*)\}/g;
  let match;

  while ((match = trailerPattern.exec(block)) !== null) {
    trailers[match[1]] = match[2];
  }

  return trailers;
}

/**
 * Validate an MT message
 */
export function validateMtMessage(message: string | ParsedMtMessage): MtValidationResult {
  const parsed = typeof message === 'string' ? parseMtMessage(message) : message;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Get message specification
  const messageType = parsed.messageType.replace('MT', '');
  const spec = MT_SPECS[`MT${messageType}`];

  if (!spec) {
    errors.push({
      field: 'messageType',
      code: 'UNKNOWN_TYPE',
      message: `Unknown message type: ${parsed.messageType}`,
      value: parsed.messageType,
    });
    
    return {
      valid: false,
      messageType: parsed.messageType,
      errors,
      warnings,
      parsedFields: parsed.textBlock,
    };
  }

  // Validate mandatory fields
  for (const fieldSpec of spec.fields) {
    if (fieldSpec.mandatory) {
      const fieldValue = parsed.textBlock[fieldSpec.tag];
      if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        errors.push({
          field: fieldSpec.tag,
          code: 'MISSING_FIELD',
          message: `Mandatory field ${fieldSpec.tag} (${fieldSpec.name}) is missing`,
        });
      }
    }
  }

  // Validate field formats
  for (const [tag, value] of Object.entries(parsed.textBlock)) {
    const fieldSpec = spec.fields.find(f => f.tag === tag);
    
    if (!fieldSpec) {
      warnings.push({
        field: tag,
        code: 'UNKNOWN_FIELD',
        message: `Unknown field tag: ${tag}`,
        value: Array.isArray(value) ? value.join('\n') : value,
      });
      continue;
    }

    // Check max length
    const valueStr = Array.isArray(value) ? value.join('\n') : value;
    if (fieldSpec.maxLength && valueStr.length > fieldSpec.maxLength) {
      errors.push({
        field: tag,
        code: 'FIELD_TOO_LONG',
        message: `Field ${tag} exceeds maximum length of ${fieldSpec.maxLength}`,
        value: valueStr,
      });
    }
  }

  // Specific validations based on message type
  if (messageType === '103') {
    validateMt103Specifics(parsed, errors, warnings);
  } else if (messageType === '940' || messageType === '950') {
    validateStatementSpecifics(parsed, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    messageType: parsed.messageType,
    errors,
    warnings,
    parsedFields: parsed.textBlock,
  };
}

/**
 * MT103-specific validations
 */
function validateMt103Specifics(
  parsed: ParsedMtMessage,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const fields = parsed.textBlock;

  // Validate 32A format (Value Date/Currency/Amount)
  const field32A = fields['32A'];
  if (field32A) {
    const value = Array.isArray(field32A) ? field32A[0] : field32A;
    if (!/^\d{6}[A-Z]{3}[\d,]+$/.test(value.replace(/\s/g, ''))) {
      errors.push({
        field: '32A',
        code: 'INVALID_FORMAT',
        message: 'Field 32A format is invalid. Expected: YYMMDDCCCNNNN,NN',
        value,
      });
    }
  }

  // Validate 71A (Details of Charges)
  const field71A = fields['71A'];
  if (field71A) {
    const value = Array.isArray(field71A) ? field71A[0] : field71A;
    if (!['BEN', 'OUR', 'SHA'].includes(value)) {
      errors.push({
        field: '71A',
        code: 'INVALID_VALUE',
        message: 'Field 71A must be BEN, OUR, or SHA',
        value,
      });
    }
  }

  // Check for beneficiary (59, 59A, or 59F)
  if (!fields['59'] && !fields['59A'] && !fields['59F']) {
    errors.push({
      field: '59',
      code: 'MISSING_FIELD',
      message: 'Beneficiary customer (field 59, 59A, or 59F) is required',
    });
  }

  // Check for ordering customer (50A, 50F, or 50K)
  if (!fields['50A'] && !fields['50F'] && !fields['50K']) {
    warnings.push({
      field: '50',
      code: 'MISSING_FIELD',
      message: 'Ordering customer (field 50A, 50F, or 50K) is recommended',
    });
  }
}

/**
 * Statement-specific validations (MT940/MT950)
 */
function validateStatementSpecifics(
  parsed: ParsedMtMessage,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const fields = parsed.textBlock;

  // Validate opening balance (60F or 60M)
  if (!fields['60F'] && !fields['60M']) {
    errors.push({
      field: '60F',
      code: 'MISSING_FIELD',
      message: 'Opening balance (field 60F or 60M) is required',
    });
  }

  // Validate closing balance (62F or 62M)
  if (!fields['62F'] && !fields['62M']) {
    errors.push({
      field: '62F',
      code: 'MISSING_FIELD',
      message: 'Closing balance (field 62F or 62M) is required',
    });
  }

  // Validate balance format
  const balanceFields = ['60F', '60M', '62F', '62M', '64', '65'];
  for (const tag of balanceFields) {
    const value = fields[tag];
    if (value) {
      const balanceValue = Array.isArray(value) ? value[0] : value;
      if (!/^[CD]\d{6}[A-Z]{3}[\d,]+$/.test(balanceValue.replace(/\s/g, ''))) {
        warnings.push({
          field: tag,
          code: 'INVALID_FORMAT',
          message: `Field ${tag} format may be invalid. Expected: D/CYYMMDDCCCNNNN,NN`,
          value: balanceValue,
        });
      }
    }
  }
}

/**
 * Extract specific field value from parsed message
 */
export function getFieldValue(parsed: ParsedMtMessage, tag: string): string | string[] | undefined {
  return parsed.textBlock[tag];
}

/**
 * Get message type from parsed message
 */
export function getMessageType(parsed: ParsedMtMessage): string {
  return parsed.messageType;
}

/**
 * Check if message is a specific type
 */
export function isMessageType(parsed: ParsedMtMessage, type: string): boolean {
  const normalizedType = type.toUpperCase().replace('MT', '');
  const messageType = parsed.messageType.replace('MT', '');
  return messageType === normalizedType;
}
