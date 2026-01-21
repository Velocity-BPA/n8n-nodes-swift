/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * MT Message parsed structure
 */
export interface ParsedMtMessage {
  messageType: string;
  basicHeader: {
    applicationId: string;
    serviceId: string;
    ltAddress: string;
    sessionNumber: string;
    sequenceNumber: string;
  };
  applicationHeader: {
    inputOutput: string;
    messageType: string;
    receiverAddress?: string;
    priority?: string;
    deliveryMonitor?: string;
    obsolescencePeriod?: string;
    inputTime?: string;
    inputDate?: string;
    mir?: string;
    outputDate?: string;
    outputTime?: string;
  };
  userHeader?: Record<string, string>;
  textBlock: Record<string, string | string[]>;
  trailers?: Record<string, string>;
  rawMessage: string;
}

/**
 * MT Message generation input
 */
export interface MtMessageInput {
  messageType: string;
  senderBic: string;
  receiverBic: string;
  fields: Record<string, string | undefined>;
}

/**
 * MT Message validation result
 */
export interface MtValidationResult {
  valid: boolean;
  messageType: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  parsedFields?: Record<string, string | string[]>;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: string;
}

/**
 * MX Message parsed structure
 */
export interface ParsedMxMessage {
  messageType: string;
  namespace: string;
  version: string;
  businessMessageIdentifier?: string;
  creationDateTime?: string;
  document: Record<string, unknown>;
  rawXml: string;
}

/**
 * MX Message validation result
 */
export interface MxValidationResult {
  valid: boolean;
  messageType: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * BIC validation result
 */
export interface BicValidationResult {
  valid: boolean;
  bic: string;
  normalized: string;
  components: {
    institutionCode: string;
    countryCode: string;
    locationCode: string;
    branchCode: string;
  };
  errors: string[];
}

/**
 * BIC lookup result
 */
export interface BicLookupResult {
  found: boolean;
  bic: string;
  institution?: string;
  branch?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  address?: string;
  isHeadquarters?: boolean;
}

/**
 * BIC search result
 */
export interface BicSearchResult {
  results: BicLookupResult[];
  totalCount: number;
  query: string;
}

/**
 * IBAN validation result
 */
export interface IbanValidationResult {
  valid: boolean;
  iban: string;
  formatted: string;
  errors: string[];
  country?: string;
  countryCode?: string;
  checkDigits?: string;
  bban?: string;
  bankCode?: string;
  branchCode?: string;
  accountNumber?: string;
  isSepa?: boolean;
}

/**
 * IBAN parse result
 */
export interface IbanParseResult {
  iban: string;
  formatted: string;
  countryCode: string;
  country: string;
  checkDigits: string;
  bban: string;
  bankCode: string;
  branchCode?: string;
  accountNumber: string;
  isSepa: boolean;
}

/**
 * IBAN generation input
 */
export interface IbanGenerationInput {
  countryCode: string;
  bankCode: string;
  branchCode?: string;
  accountNumber: string;
}

/**
 * Amount formatting options
 */
export interface AmountFormatOptions {
  currency?: string;
  decimalPlaces?: number;
  useSwiftFormat?: boolean;
}

/**
 * Reference generation options
 */
export interface ReferenceGenerationOptions {
  type: 'uetr' | 'message' | 'transaction';
  prefix?: string;
  includeTimestamp?: boolean;
}

/**
 * Date format options
 */
export interface DateFormatOptions {
  format: 'swift' | 'iso' | 'yymmdd' | 'yyyymmdd';
}

/**
 * Statement line entry
 */
export interface StatementEntry {
  valueDate: string;
  entryDate?: string;
  debitCredit: 'C' | 'D' | 'RC' | 'RD';
  fundsCode?: string;
  amount: number;
  currency: string;
  transactionType: string;
  reference: string;
  supplementaryDetails?: string;
  informationToAccountOwner?: string;
}

/**
 * Statement balance
 */
export interface StatementBalance {
  debitCredit: 'C' | 'D';
  date: string;
  currency: string;
  amount: number;
}

/**
 * Parsed statement
 */
export interface ParsedStatement {
  transactionReference: string;
  relatedReference?: string;
  accountIdentification: string;
  statementNumber: string;
  sequenceNumber?: string;
  openingBalance: StatementBalance;
  closingBalance: StatementBalance;
  closingAvailableBalance?: StatementBalance;
  forwardAvailableBalance?: StatementBalance[];
  entries: StatementEntry[];
}

/**
 * ISO 20022 message types
 */
export type Iso20022MessageType =
  | 'pacs.008'
  | 'pacs.009'
  | 'pacs.002'
  | 'camt.053'
  | 'camt.054'
  | 'pain.001'
  | 'pain.002';
