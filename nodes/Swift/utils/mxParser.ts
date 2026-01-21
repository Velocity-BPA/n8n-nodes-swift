/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ParsedMxMessage, MxValidationResult, ValidationError, ValidationWarning, Iso20022MessageType } from './types';

/**
 * ISO 20022 namespace patterns
 */
const NAMESPACE_PATTERNS: Record<string, RegExp> = {
  'pacs.008': /urn:iso:std:iso:20022:tech:xsd:pacs\.008\.\d{3}\.\d{2}/,
  'pacs.009': /urn:iso:std:iso:20022:tech:xsd:pacs\.009\.\d{3}\.\d{2}/,
  'pacs.002': /urn:iso:std:iso:20022:tech:xsd:pacs\.002\.\d{3}\.\d{2}/,
  'camt.053': /urn:iso:std:iso:20022:tech:xsd:camt\.053\.\d{3}\.\d{2}/,
  'camt.054': /urn:iso:std:iso:20022:tech:xsd:camt\.054\.\d{3}\.\d{2}/,
  'pain.001': /urn:iso:std:iso:20022:tech:xsd:pain\.001\.\d{3}\.\d{2}/,
  'pain.002': /urn:iso:std:iso:20022:tech:xsd:pain\.002\.\d{3}\.\d{2}/,
};

/**
 * Parse an ISO 20022 MX message (XML) into structured format
 */
export function parseMxMessage(xmlContent: string): ParsedMxMessage {
  const result: ParsedMxMessage = {
    messageType: '',
    namespace: '',
    version: '',
    document: {},
    rawXml: xmlContent,
  };

  // Extract namespace
  const namespaceMatch = xmlContent.match(/xmlns[^=]*=["']([^"']+)["']/);
  if (namespaceMatch) {
    result.namespace = namespaceMatch[1];
    
    // Determine message type from namespace
    for (const [type, pattern] of Object.entries(NAMESPACE_PATTERNS)) {
      if (pattern.test(result.namespace)) {
        result.messageType = type;
        break;
      }
    }

    // Extract version from namespace
    const versionMatch = result.namespace.match(/\.(\d{3}\.\d{2})$/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }
  }

  // Extract business message identifier
  const bizMsgIdrMatch = xmlContent.match(/<BizMsgIdr>([^<]+)<\/BizMsgIdr>/);
  if (bizMsgIdrMatch) {
    result.businessMessageIdentifier = bizMsgIdrMatch[1];
  }

  // Extract creation date time
  const creDtTmMatch = xmlContent.match(/<CreDtTm>([^<]+)<\/CreDtTm>/);
  if (creDtTmMatch) {
    result.creationDateTime = creDtTmMatch[1];
  }

  // Parse document content based on message type
  result.document = parseXmlDocument(xmlContent, result.messageType);

  return result;
}

/**
 * Parse XML document content
 */
function parseXmlDocument(xml: string, messageType: string): Record<string, unknown> {
  const doc: Record<string, unknown> = {};

  switch (messageType) {
    case 'pacs.008':
      doc.fiToFiCstmrCdtTrf = parsePacs008(xml);
      break;
    case 'pacs.009':
      doc.fiToFiFICdtTrf = parsePacs009(xml);
      break;
    case 'pacs.002':
      doc.fiToFiPmtStsRpt = parsePacs002(xml);
      break;
    case 'camt.053':
      doc.bkToCstmrStmt = parseCamt053(xml);
      break;
    case 'camt.054':
      doc.bkToCstmrDbtCdtNtfctn = parseCamt054(xml);
      break;
    case 'pain.001':
      doc.cstmrCdtTrfInitn = parsePain001(xml);
      break;
    default:
      doc.rawContent = extractTextContent(xml);
  }

  return doc;
}

/**
 * Parse pacs.008 (FI to FI Customer Credit Transfer)
 */
function parsePacs008(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    creditTransferTransactionInfo: extractCreditTransferInfo(xml),
  };
}

/**
 * Parse pacs.009 (FI to FI Financial Institution Credit Transfer)
 */
function parsePacs009(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    creditTransferTransactionInfo: extractCreditTransferInfo(xml),
  };
}

/**
 * Parse pacs.002 (Payment Status Report)
 */
function parsePacs002(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    originalGroupInfoAndStatus: extractOriginalGroupInfo(xml),
    transactionInfoAndStatus: extractTransactionStatus(xml),
  };
}

/**
 * Parse camt.053 (Bank to Customer Statement)
 */
function parseCamt053(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    statement: extractStatement(xml),
  };
}

/**
 * Parse camt.054 (Bank to Customer Debit/Credit Notification)
 */
function parseCamt054(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    notification: extractNotification(xml),
  };
}

/**
 * Parse pain.001 (Customer Credit Transfer Initiation)
 */
function parsePain001(xml: string): Record<string, unknown> {
  return {
    groupHeader: extractGroupHeader(xml),
    paymentInfo: extractPaymentInfo(xml),
  };
}

/**
 * Extract Group Header information
 */
function extractGroupHeader(xml: string): Record<string, string | undefined> {
  const header: Record<string, string | undefined> = {};

  const msgIdMatch = xml.match(/<MsgId>([^<]+)<\/MsgId>/);
  if (msgIdMatch) header.messageId = msgIdMatch[1];

  const creDtTmMatch = xml.match(/<CreDtTm>([^<]+)<\/CreDtTm>/);
  if (creDtTmMatch) header.creationDateTime = creDtTmMatch[1];

  const nbOfTxsMatch = xml.match(/<NbOfTxs>([^<]+)<\/NbOfTxs>/);
  if (nbOfTxsMatch) header.numberOfTransactions = nbOfTxsMatch[1];

  const ctrlSumMatch = xml.match(/<CtrlSum>([^<]+)<\/CtrlSum>/);
  if (ctrlSumMatch) header.controlSum = ctrlSumMatch[1];

  const sttlmMtdMatch = xml.match(/<SttlmMtd>([^<]+)<\/SttlmMtd>/);
  if (sttlmMtdMatch) header.settlementMethod = sttlmMtdMatch[1];

  return header;
}

/**
 * Extract Credit Transfer Transaction Information
 */
function extractCreditTransferInfo(xml: string): Record<string, unknown>[] {
  const transactions: Record<string, unknown>[] = [];
  
  // Find all CdtTrfTxInf blocks
  const txInfoPattern = /<CdtTrfTxInf>([\s\S]*?)<\/CdtTrfTxInf>/g;
  let match;

  while ((match = txInfoPattern.exec(xml)) !== null) {
    const txXml = match[1];
    const tx: Record<string, unknown> = {};

    // Payment ID
    const pmtIdMatch = txXml.match(/<InstrId>([^<]+)<\/InstrId>/);
    if (pmtIdMatch) tx.instructionId = pmtIdMatch[1];

    const endToEndIdMatch = txXml.match(/<EndToEndId>([^<]+)<\/EndToEndId>/);
    if (endToEndIdMatch) tx.endToEndId = endToEndIdMatch[1];

    const uetrMatch = txXml.match(/<UETR>([^<]+)<\/UETR>/);
    if (uetrMatch) tx.uetr = uetrMatch[1];

    // Amount
    const amtMatch = txXml.match(/<InstdAmt[^>]*>([^<]+)<\/InstdAmt>/);
    if (amtMatch) tx.instructedAmount = amtMatch[1];

    const ccyMatch = txXml.match(/<InstdAmt\s+Ccy="([^"]+)"/);
    if (ccyMatch) tx.currency = ccyMatch[1];

    // Debtor
    const dbtrNmMatch = txXml.match(/<Dbtr>[\s\S]*?<Nm>([^<]+)<\/Nm>/);
    if (dbtrNmMatch) tx.debtorName = dbtrNmMatch[1];

    // Creditor
    const cdtrNmMatch = txXml.match(/<Cdtr>[\s\S]*?<Nm>([^<]+)<\/Nm>/);
    if (cdtrNmMatch) tx.creditorName = cdtrNmMatch[1];

    transactions.push(tx);
  }

  return transactions;
}

/**
 * Extract Original Group Information
 */
function extractOriginalGroupInfo(xml: string): Record<string, string | undefined> {
  const info: Record<string, string | undefined> = {};

  const orgnlMsgIdMatch = xml.match(/<OrgnlMsgId>([^<]+)<\/OrgnlMsgId>/);
  if (orgnlMsgIdMatch) info.originalMessageId = orgnlMsgIdMatch[1];

  const orgnlMsgNmIdMatch = xml.match(/<OrgnlMsgNmId>([^<]+)<\/OrgnlMsgNmId>/);
  if (orgnlMsgNmIdMatch) info.originalMessageNameId = orgnlMsgNmIdMatch[1];

  const grpStsMatch = xml.match(/<GrpSts>([^<]+)<\/GrpSts>/);
  if (grpStsMatch) info.groupStatus = grpStsMatch[1];

  return info;
}

/**
 * Extract Transaction Status Information
 */
function extractTransactionStatus(xml: string): Record<string, unknown>[] {
  const transactions: Record<string, unknown>[] = [];
  
  const txInfAndStsPattern = /<TxInfAndSts>([\s\S]*?)<\/TxInfAndSts>/g;
  let match;

  while ((match = txInfAndStsPattern.exec(xml)) !== null) {
    const txXml = match[1];
    const tx: Record<string, unknown> = {};

    const orgnlInstrIdMatch = txXml.match(/<OrgnlInstrId>([^<]+)<\/OrgnlInstrId>/);
    if (orgnlInstrIdMatch) tx.originalInstructionId = orgnlInstrIdMatch[1];

    const orgnlEndToEndIdMatch = txXml.match(/<OrgnlEndToEndId>([^<]+)<\/OrgnlEndToEndId>/);
    if (orgnlEndToEndIdMatch) tx.originalEndToEndId = orgnlEndToEndIdMatch[1];

    const txStsMatch = txXml.match(/<TxSts>([^<]+)<\/TxSts>/);
    if (txStsMatch) tx.transactionStatus = txStsMatch[1];

    transactions.push(tx);
  }

  return transactions;
}

/**
 * Extract Statement Information
 */
function extractStatement(xml: string): Record<string, unknown> {
  const stmt: Record<string, unknown> = {};

  const idMatch = xml.match(/<Id>([^<]+)<\/Id>/);
  if (idMatch) stmt.id = idMatch[1];

  const elctrncSeqNbMatch = xml.match(/<ElctrncSeqNb>([^<]+)<\/ElctrncSeqNb>/);
  if (elctrncSeqNbMatch) stmt.electronicSequenceNumber = elctrncSeqNbMatch[1];

  const creDtTmMatch = xml.match(/<CreDtTm>([^<]+)<\/CreDtTm>/);
  if (creDtTmMatch) stmt.creationDateTime = creDtTmMatch[1];

  // Extract balances
  stmt.balances = extractBalances(xml);

  // Extract entries
  stmt.entries = extractEntries(xml);

  return stmt;
}

/**
 * Extract Notification Information
 */
function extractNotification(xml: string): Record<string, unknown> {
  const ntfctn: Record<string, unknown> = {};

  const idMatch = xml.match(/<Id>([^<]+)<\/Id>/);
  if (idMatch) ntfctn.id = idMatch[1];

  const creDtTmMatch = xml.match(/<CreDtTm>([^<]+)<\/CreDtTm>/);
  if (creDtTmMatch) ntfctn.creationDateTime = creDtTmMatch[1];

  // Extract entries
  ntfctn.entries = extractEntries(xml);

  return ntfctn;
}

/**
 * Extract Payment Information
 */
function extractPaymentInfo(xml: string): Record<string, unknown>[] {
  const payments: Record<string, unknown>[] = [];
  
  const pmtInfPattern = /<PmtInf>([\s\S]*?)<\/PmtInf>/g;
  let match;

  while ((match = pmtInfPattern.exec(xml)) !== null) {
    const pmtXml = match[1];
    const pmt: Record<string, unknown> = {};

    const pmtInfIdMatch = pmtXml.match(/<PmtInfId>([^<]+)<\/PmtInfId>/);
    if (pmtInfIdMatch) pmt.paymentInfoId = pmtInfIdMatch[1];

    const pmtMtdMatch = pmtXml.match(/<PmtMtd>([^<]+)<\/PmtMtd>/);
    if (pmtMtdMatch) pmt.paymentMethod = pmtMtdMatch[1];

    const nbOfTxsMatch = pmtXml.match(/<NbOfTxs>([^<]+)<\/NbOfTxs>/);
    if (nbOfTxsMatch) pmt.numberOfTransactions = nbOfTxsMatch[1];

    const ctrlSumMatch = pmtXml.match(/<CtrlSum>([^<]+)<\/CtrlSum>/);
    if (ctrlSumMatch) pmt.controlSum = ctrlSumMatch[1];

    payments.push(pmt);
  }

  return payments;
}

/**
 * Extract Balances
 */
function extractBalances(xml: string): Record<string, unknown>[] {
  const balances: Record<string, unknown>[] = [];
  
  const balPattern = /<Bal>([\s\S]*?)<\/Bal>/g;
  let match;

  while ((match = balPattern.exec(xml)) !== null) {
    const balXml = match[1];
    const bal: Record<string, unknown> = {};

    const tpCdMatch = balXml.match(/<Cd>([^<]+)<\/Cd>/);
    if (tpCdMatch) bal.typeCode = tpCdMatch[1];

    const amtMatch = balXml.match(/<Amt[^>]*>([^<]+)<\/Amt>/);
    if (amtMatch) bal.amount = amtMatch[1];

    const ccyMatch = balXml.match(/<Amt\s+Ccy="([^"]+)"/);
    if (ccyMatch) bal.currency = ccyMatch[1];

    const cdtDbtIndMatch = balXml.match(/<CdtDbtInd>([^<]+)<\/CdtDbtInd>/);
    if (cdtDbtIndMatch) bal.creditDebitIndicator = cdtDbtIndMatch[1];

    const dtMatch = balXml.match(/<Dt>([^<]+)<\/Dt>/);
    if (dtMatch) bal.date = dtMatch[1];

    balances.push(bal);
  }

  return balances;
}

/**
 * Extract Entries
 */
function extractEntries(xml: string): Record<string, unknown>[] {
  const entries: Record<string, unknown>[] = [];
  
  const ntryPattern = /<Ntry>([\s\S]*?)<\/Ntry>/g;
  let match;

  while ((match = ntryPattern.exec(xml)) !== null) {
    const ntryXml = match[1];
    const entry: Record<string, unknown> = {};

    const amtMatch = ntryXml.match(/<Amt[^>]*>([^<]+)<\/Amt>/);
    if (amtMatch) entry.amount = amtMatch[1];

    const ccyMatch = ntryXml.match(/<Amt\s+Ccy="([^"]+)"/);
    if (ccyMatch) entry.currency = ccyMatch[1];

    const cdtDbtIndMatch = ntryXml.match(/<CdtDbtInd>([^<]+)<\/CdtDbtInd>/);
    if (cdtDbtIndMatch) entry.creditDebitIndicator = cdtDbtIndMatch[1];

    const stsMatch = ntryXml.match(/<Sts>([^<]+)<\/Sts>/);
    if (stsMatch) entry.status = stsMatch[1];

    const bookgDtMatch = ntryXml.match(/<BookgDt>[\s\S]*?<Dt>([^<]+)<\/Dt>/);
    if (bookgDtMatch) entry.bookingDate = bookgDtMatch[1];

    const valDtMatch = ntryXml.match(/<ValDt>[\s\S]*?<Dt>([^<]+)<\/Dt>/);
    if (valDtMatch) entry.valueDate = valDtMatch[1];

    entries.push(entry);
  }

  return entries;
}

/**
 * Extract text content from XML (fallback)
 */
function extractTextContent(xml: string): string {
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Validate an ISO 20022 MX message
 */
export function validateMxMessage(xmlContent: string): MxValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check if valid XML structure
  if (!xmlContent.trim().startsWith('<?xml') && !xmlContent.trim().startsWith('<')) {
    errors.push({
      field: 'document',
      code: 'INVALID_XML',
      message: 'Content does not appear to be valid XML',
    });
  }

  // Check for namespace
  const namespaceMatch = xmlContent.match(/xmlns[^=]*=["']([^"']+)["']/);
  if (!namespaceMatch) {
    errors.push({
      field: 'namespace',
      code: 'MISSING_NAMESPACE',
      message: 'ISO 20022 namespace is missing',
    });
  }

  // Determine message type
  let messageType = '';
  if (namespaceMatch) {
    for (const [type, pattern] of Object.entries(NAMESPACE_PATTERNS)) {
      if (pattern.test(namespaceMatch[1])) {
        messageType = type;
        break;
      }
    }
    
    if (!messageType) {
      warnings.push({
        field: 'namespace',
        code: 'UNKNOWN_MESSAGE_TYPE',
        message: `Unknown ISO 20022 message type for namespace: ${namespaceMatch[1]}`,
      });
    }
  }

  // Check for required elements based on message type
  if (messageType) {
    validateMxRequiredElements(xmlContent, messageType, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    messageType,
    errors,
    warnings,
  };
}

/**
 * Validate required elements for specific message types
 */
function validateMxRequiredElements(
  xml: string,
  messageType: string,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  // Group Header is required for most message types
  if (!xml.includes('<GrpHdr>')) {
    errors.push({
      field: 'GrpHdr',
      code: 'MISSING_ELEMENT',
      message: 'Group Header (GrpHdr) is required',
    });
  }

  // Message ID is always required
  if (!xml.includes('<MsgId>')) {
    errors.push({
      field: 'MsgId',
      code: 'MISSING_ELEMENT',
      message: 'Message ID (MsgId) is required',
    });
  }

  // Creation Date Time is always required
  if (!xml.includes('<CreDtTm>')) {
    errors.push({
      field: 'CreDtTm',
      code: 'MISSING_ELEMENT',
      message: 'Creation Date Time (CreDtTm) is required',
    });
  }

  // Type-specific validations
  if (messageType === 'pacs.008' || messageType === 'pacs.009') {
    if (!xml.includes('<CdtTrfTxInf>')) {
      errors.push({
        field: 'CdtTrfTxInf',
        code: 'MISSING_ELEMENT',
        message: 'Credit Transfer Transaction Information (CdtTrfTxInf) is required',
      });
    }
  }

  if (messageType === 'pain.001') {
    if (!xml.includes('<PmtInf>')) {
      errors.push({
        field: 'PmtInf',
        code: 'MISSING_ELEMENT',
        message: 'Payment Information (PmtInf) is required',
      });
    }
  }
}

/**
 * Get supported ISO 20022 message types
 */
export function getSupportedMxMessageTypes(): Iso20022MessageType[] {
  return Object.keys(NAMESPACE_PATTERNS) as Iso20022MessageType[];
}
