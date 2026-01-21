/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { MtMessageInput } from './types';
import { MT_SPECS, BANK_OPERATION_CODES, CHARGE_CODES } from '../../../data/mtTemplates';
import { validateBic } from './bicValidator';

/**
 * Generate an MT message from structured input
 */
export function generateMtMessage(input: MtMessageInput): string {
  const { messageType, senderBic, receiverBic, fields } = input;
  const type = messageType.replace('MT', '');

  // Validate sender and receiver BICs
  const senderValidation = validateBic(senderBic);
  const receiverValidation = validateBic(receiverBic);

  if (!senderValidation.valid) {
    throw new Error(`Invalid sender BIC: ${senderValidation.errors.join(', ')}`);
  }

  if (!receiverValidation.valid) {
    throw new Error(`Invalid receiver BIC: ${receiverValidation.errors.join(', ')}`);
  }

  // Normalize BICs to 12 characters
  const normalizedSender = normalizeBicTo12(senderValidation.normalized);
  const normalizedReceiver = normalizeBicTo12(receiverValidation.normalized);

  // Generate blocks
  const block1 = generateBlock1(normalizedSender);
  const block2 = generateBlock2(type, normalizedReceiver);
  const block3 = generateBlock3(fields);
  const block4 = generateBlock4(type, fields);
  const block5 = generateBlock5();

  return `${block1}${block2}${block3}${block4}${block5}`;
}

/**
 * Generate Block 1 (Basic Header)
 */
function generateBlock1(senderBic: string): string {
  const sessionNumber = '0000';
  const sequenceNumber = '000000';
  return `{1:F01${senderBic}${sessionNumber}${sequenceNumber}}`;
}

/**
 * Generate Block 2 (Application Header)
 */
function generateBlock2(messageType: string, receiverBic: string): string {
  const priority = 'N'; // Normal priority
  const deliveryMonitor = ''; // No delivery monitoring
  return `{2:I${messageType}${receiverBic}${priority}${deliveryMonitor}}`;
}

/**
 * Generate Block 3 (User Header)
 */
function generateBlock3(fields: Record<string, string | undefined>): string {
  const headerFields: string[] = [];

  // Add UETR if provided (field 121)
  if (fields.uetr) {
    headerFields.push(`{121:${fields.uetr}}`);
  }

  // Add MUR (Message User Reference) if provided (field 108)
  if (fields.mur) {
    headerFields.push(`{108:${fields.mur}}`);
  }

  if (headerFields.length === 0) {
    return '';
  }

  return `{3:${headerFields.join('')}}`;
}

/**
 * Generate Block 4 (Text Block) based on message type
 */
function generateBlock4(messageType: string, fields: Record<string, string | undefined>): string {
  let content = '';

  switch (messageType) {
    case '103':
      content = generateMT103Content(fields);
      break;
    case '202':
      content = generateMT202Content(fields);
      break;
    case '940':
      content = generateMT940Content(fields);
      break;
    case '950':
      content = generateMT950Content(fields);
      break;
    default:
      throw new Error(`Unsupported message type: MT${messageType}`);
  }

  return `{4:\r\n${content}-}`;
}

/**
 * Generate Block 5 (Trailers)
 */
function generateBlock5(): string {
  // Empty trailers block - checksum would be calculated by SWIFT network
  return '{5:}';
}

/**
 * Generate MT103 content
 */
function generateMT103Content(fields: Record<string, string | undefined>): string {
  const lines: string[] = [];

  // Field 20: Sender's Reference (mandatory)
  if (fields.senderReference) {
    lines.push(`:20:${fields.senderReference}`);
  }

  // Field 23B: Bank Operation Code (mandatory)
  const opCode = fields.bankOperationCode || 'CRED';
  if (!BANK_OPERATION_CODES[opCode]) {
    throw new Error(`Invalid bank operation code: ${opCode}`);
  }
  lines.push(`:23B:${opCode}`);

  // Field 32A: Value Date/Currency/Amount (mandatory)
  if (fields.valueDate && fields.currency && fields.amount) {
    const formattedAmount = formatSwiftAmount(fields.amount);
    lines.push(`:32A:${fields.valueDate}${fields.currency}${formattedAmount}`);
  }

  // Field 33B: Currency/Instructed Amount (optional)
  if (fields.instructedCurrency && fields.instructedAmount) {
    const formattedAmount = formatSwiftAmount(fields.instructedAmount);
    lines.push(`:33B:${fields.instructedCurrency}${formattedAmount}`);
  }

  // Field 50K: Ordering Customer (mandatory - one of 50A/50F/50K)
  if (fields.orderingCustomerAccount || fields.orderingCustomerName) {
    let field50 = ':50K:';
    if (fields.orderingCustomerAccount) {
      field50 += `/${fields.orderingCustomerAccount}\r\n`;
    }
    if (fields.orderingCustomerName) {
      field50 += fields.orderingCustomerName;
    }
    lines.push(field50);
  }

  // Field 52A: Ordering Institution (optional)
  if (fields.orderingInstitution) {
    lines.push(`:52A:${fields.orderingInstitution}`);
  }

  // Field 53A: Sender's Correspondent (optional)
  if (fields.sendersCorrespondent) {
    lines.push(`:53A:${fields.sendersCorrespondent}`);
  }

  // Field 54A: Receiver's Correspondent (optional)
  if (fields.receiversCorrespondent) {
    lines.push(`:54A:${fields.receiversCorrespondent}`);
  }

  // Field 56A: Intermediary Institution (optional)
  if (fields.intermediaryInstitution) {
    lines.push(`:56A:${fields.intermediaryInstitution}`);
  }

  // Field 57A: Account With Institution (optional)
  if (fields.accountWithInstitution) {
    lines.push(`:57A:${fields.accountWithInstitution}`);
  }

  // Field 59: Beneficiary Customer (mandatory - one of 59/59A/59F)
  if (fields.beneficiaryAccount || fields.beneficiaryName) {
    let field59 = ':59:';
    if (fields.beneficiaryAccount) {
      field59 += `/${fields.beneficiaryAccount}\r\n`;
    }
    if (fields.beneficiaryName) {
      field59 += fields.beneficiaryName;
    }
    lines.push(field59);
  }

  // Field 70: Remittance Information (optional)
  if (fields.remittanceInfo) {
    lines.push(`:70:${fields.remittanceInfo}`);
  }

  // Field 71A: Details of Charges (mandatory)
  const charges = fields.charges || 'SHA';
  if (!CHARGE_CODES[charges]) {
    throw new Error(`Invalid charge code: ${charges}`);
  }
  lines.push(`:71A:${charges}`);

  // Field 72: Sender to Receiver Information (optional)
  if (fields.senderToReceiverInfo) {
    lines.push(`:72:${fields.senderToReceiverInfo}`);
  }

  return lines.join('\r\n') + '\r\n';
}

/**
 * Generate MT202 content
 */
function generateMT202Content(fields: Record<string, string | undefined>): string {
  const lines: string[] = [];

  // Field 20: Transaction Reference Number (mandatory)
  if (fields.transactionReference) {
    lines.push(`:20:${fields.transactionReference}`);
  }

  // Field 21: Related Reference (mandatory)
  if (fields.relatedReference) {
    lines.push(`:21:${fields.relatedReference}`);
  }

  // Field 32A: Value Date/Currency/Amount (mandatory)
  if (fields.valueDate && fields.currency && fields.amount) {
    const formattedAmount = formatSwiftAmount(fields.amount);
    lines.push(`:32A:${fields.valueDate}${fields.currency}${formattedAmount}`);
  }

  // Field 52A: Ordering Institution (optional)
  if (fields.orderingInstitution) {
    lines.push(`:52A:${fields.orderingInstitution}`);
  }

  // Field 53A: Sender's Correspondent (optional)
  if (fields.sendersCorrespondent) {
    lines.push(`:53A:${fields.sendersCorrespondent}`);
  }

  // Field 54A: Receiver's Correspondent (optional)
  if (fields.receiversCorrespondent) {
    lines.push(`:54A:${fields.receiversCorrespondent}`);
  }

  // Field 56A: Intermediary (optional)
  if (fields.intermediary) {
    lines.push(`:56A:${fields.intermediary}`);
  }

  // Field 57A: Account With Institution (optional)
  if (fields.accountWithInstitution) {
    lines.push(`:57A:${fields.accountWithInstitution}`);
  }

  // Field 58A: Beneficiary Institution (mandatory)
  if (fields.beneficiaryInstitution) {
    lines.push(`:58A:${fields.beneficiaryInstitution}`);
  }

  // Field 72: Sender to Receiver Information (optional)
  if (fields.senderToReceiverInfo) {
    lines.push(`:72:${fields.senderToReceiverInfo}`);
  }

  return lines.join('\r\n') + '\r\n';
}

/**
 * Generate MT940 content
 */
function generateMT940Content(fields: Record<string, string | undefined>): string {
  const lines: string[] = [];

  // Field 20: Transaction Reference Number (mandatory)
  if (fields.transactionReference) {
    lines.push(`:20:${fields.transactionReference}`);
  }

  // Field 25: Account Identification (mandatory)
  if (fields.accountId) {
    lines.push(`:25:${fields.accountId}`);
  }

  // Field 28C: Statement Number/Sequence Number (mandatory)
  if (fields.statementNumber) {
    lines.push(`:28C:${fields.statementNumber}`);
  }

  // Field 60F: Opening Balance (mandatory)
  if (fields.openingBalance) {
    lines.push(`:60F:${fields.openingBalance}`);
  }

  // Field 61: Statement Lines (optional, multiple)
  if (fields.statementLines) {
    const statementLines = fields.statementLines.split('|');
    for (const line of statementLines) {
      lines.push(`:61:${line}`);
    }
  }

  // Field 62F: Closing Balance (mandatory)
  if (fields.closingBalance) {
    lines.push(`:62F:${fields.closingBalance}`);
  }

  // Field 64: Closing Available Balance (optional)
  if (fields.closingAvailableBalance) {
    lines.push(`:64:${fields.closingAvailableBalance}`);
  }

  return lines.join('\r\n') + '\r\n';
}

/**
 * Generate MT950 content
 */
function generateMT950Content(fields: Record<string, string | undefined>): string {
  const lines: string[] = [];

  // Field 20: Transaction Reference Number (mandatory)
  if (fields.transactionReference) {
    lines.push(`:20:${fields.transactionReference}`);
  }

  // Field 25: Account Identification (mandatory)
  if (fields.accountId) {
    lines.push(`:25:${fields.accountId}`);
  }

  // Field 28C: Statement Number/Sequence Number (mandatory)
  if (fields.statementNumber) {
    lines.push(`:28C:${fields.statementNumber}`);
  }

  // Field 60F: Opening Balance (mandatory)
  if (fields.openingBalance) {
    lines.push(`:60F:${fields.openingBalance}`);
  }

  // Field 61: Statement Lines (optional, multiple)
  if (fields.statementLines) {
    const statementLines = fields.statementLines.split('|');
    for (const line of statementLines) {
      lines.push(`:61:${line}`);
    }
  }

  // Field 62F: Closing Balance (mandatory)
  if (fields.closingBalance) {
    lines.push(`:62F:${fields.closingBalance}`);
  }

  return lines.join('\r\n') + '\r\n';
}

/**
 * Normalize BIC to 12 characters (add XXX if needed)
 */
function normalizeBicTo12(bic: string): string {
  if (bic.length === 8) {
    return bic + 'XXXX';
  }
  if (bic.length === 11) {
    return bic + 'X';
  }
  return bic;
}

/**
 * Format amount for SWIFT (comma as decimal separator)
 */
function formatSwiftAmount(amount: string): string {
  // Parse the amount
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  // Format with comma as decimal separator
  const formatted = numAmount.toFixed(2).replace('.', ',');
  return formatted;
}

/**
 * Generate a UETR (Unique End-to-End Transaction Reference)
 * Format: UUID v4
 */
export function generateUetr(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a message reference (16 characters)
 */
export function generateMessageReference(prefix?: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ref = (prefix || '') + timestamp + random;
  return ref.slice(0, 16).padEnd(16, '0');
}

/**
 * Format date for SWIFT (YYMMDD)
 */
export function formatSwiftDate(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Parse SWIFT date (YYMMDD) to Date object
 */
export function parseSwiftDate(swiftDate: string): Date {
  if (swiftDate.length !== 6) {
    throw new Error(`Invalid SWIFT date format: ${swiftDate}`);
  }
  
  const year = parseInt(swiftDate.slice(0, 2), 10);
  const month = parseInt(swiftDate.slice(2, 4), 10) - 1;
  const day = parseInt(swiftDate.slice(4, 6), 10);
  
  // Assume 20xx for years 00-30, 19xx for years 31-99
  const fullYear = year <= 30 ? 2000 + year : 1900 + year;
  
  return new Date(fullYear, month, day);
}
