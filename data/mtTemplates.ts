/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface MtFieldSpec {
  tag: string;
  name: string;
  mandatory: boolean;
  format: string;
  description: string;
  maxLength?: number;
}

export interface MtMessageSpec {
  type: string;
  name: string;
  description: string;
  category: string;
  fields: MtFieldSpec[];
}

/**
 * MT103 - Single Customer Credit Transfer
 */
export const MT103_SPEC: MtMessageSpec = {
  type: 'MT103',
  name: 'Single Customer Credit Transfer',
  description: 'Customer payment message used for cross-border or domestic payments',
  category: 'Customer Payments',
  fields: [
    { tag: '20', name: 'Sender\'s Reference', mandatory: true, format: '16x', description: 'Unique reference assigned by sender', maxLength: 16 },
    { tag: '13C', name: 'Time Indication', mandatory: false, format: '/8c/4!n1!x4!n', description: 'Time indication for credit/debit' },
    { tag: '23B', name: 'Bank Operation Code', mandatory: true, format: '4!c', description: 'Type of operation: CRED, CRTS, SPAY, SPRI, SSTD' },
    { tag: '23E', name: 'Instruction Code', mandatory: false, format: '4!c[/30x]', description: 'Payment instruction codes' },
    { tag: '26T', name: 'Transaction Type Code', mandatory: false, format: '3!c', description: 'Transaction type code' },
    { tag: '32A', name: 'Value Date/Currency/Amount', mandatory: true, format: '6!n3!a15d', description: 'Value date, currency code, and settlement amount' },
    { tag: '33B', name: 'Currency/Instructed Amount', mandatory: false, format: '3!a15d', description: 'Original instructed amount if different from 32A' },
    { tag: '36', name: 'Exchange Rate', mandatory: false, format: '12d', description: 'Exchange rate applied' },
    { tag: '50A', name: 'Ordering Customer (BIC)', mandatory: false, format: '[/34x]4!a2!a2!c[3!c]', description: 'Ordering customer identified by BIC' },
    { tag: '50F', name: 'Ordering Customer (Party)', mandatory: false, format: '35x*4', description: 'Ordering customer with name and address' },
    { tag: '50K', name: 'Ordering Customer (Name/Address)', mandatory: false, format: '[/34x]4*35x', description: 'Ordering customer name and address' },
    { tag: '51A', name: 'Sending Institution', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Sending institution (if different from sender)' },
    { tag: '52A', name: 'Ordering Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Ordering institution identified by BIC' },
    { tag: '52D', name: 'Ordering Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Ordering institution name and address' },
    { tag: '53A', name: 'Sender\'s Correspondent (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Sender correspondent bank BIC' },
    { tag: '53B', name: 'Sender\'s Correspondent (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Sender correspondent location' },
    { tag: '53D', name: 'Sender\'s Correspondent (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Sender correspondent name and address' },
    { tag: '54A', name: 'Receiver\'s Correspondent (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Receiver correspondent bank BIC' },
    { tag: '54B', name: 'Receiver\'s Correspondent (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Receiver correspondent location' },
    { tag: '54D', name: 'Receiver\'s Correspondent (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Receiver correspondent name and address' },
    { tag: '55A', name: 'Third Reimbursement Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Third reimbursement institution BIC' },
    { tag: '55B', name: 'Third Reimbursement Institution (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Third reimbursement institution location' },
    { tag: '55D', name: 'Third Reimbursement Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Third reimbursement institution name and address' },
    { tag: '56A', name: 'Intermediary Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Intermediary institution BIC' },
    { tag: '56C', name: 'Intermediary Institution (Account)', mandatory: false, format: '/34x', description: 'Intermediary institution account' },
    { tag: '56D', name: 'Intermediary Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Intermediary institution name and address' },
    { tag: '57A', name: 'Account With Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Account with institution BIC' },
    { tag: '57B', name: 'Account With Institution (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Account with institution location' },
    { tag: '57C', name: 'Account With Institution (Account)', mandatory: false, format: '/34x', description: 'Account with institution account' },
    { tag: '57D', name: 'Account With Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Account with institution name and address' },
    { tag: '59', name: 'Beneficiary Customer (Account)', mandatory: true, format: '[/34x]4*35x', description: 'Beneficiary customer with optional account' },
    { tag: '59A', name: 'Beneficiary Customer (BIC)', mandatory: false, format: '[/34x]4!a2!a2!c[3!c]', description: 'Beneficiary customer identified by BIC' },
    { tag: '59F', name: 'Beneficiary Customer (Party)', mandatory: false, format: '35x*4', description: 'Beneficiary customer structured format' },
    { tag: '70', name: 'Remittance Information', mandatory: false, format: '4*35x', description: 'Remittance information for beneficiary', maxLength: 140 },
    { tag: '71A', name: 'Details of Charges', mandatory: true, format: '3!a', description: 'Charges: BEN, OUR, SHA' },
    { tag: '71F', name: 'Sender\'s Charges', mandatory: false, format: '3!a15d', description: 'Charges deducted by sender\'s bank' },
    { tag: '71G', name: 'Receiver\'s Charges', mandatory: false, format: '3!a15d', description: 'Charges to be collected by receiver' },
    { tag: '72', name: 'Sender to Receiver Information', mandatory: false, format: '6*35x', description: 'Additional information for receiver', maxLength: 210 },
    { tag: '77B', name: 'Regulatory Reporting', mandatory: false, format: '3*35x', description: 'Regulatory reporting codes', maxLength: 105 },
    { tag: '77T', name: 'Envelope Contents', mandatory: false, format: '9000z', description: 'Envelope contents for SWIFT gpi' },
  ],
};

/**
 * MT202 - General Financial Institution Transfer
 */
export const MT202_SPEC: MtMessageSpec = {
  type: 'MT202',
  name: 'General Financial Institution Transfer',
  description: 'Bank-to-bank payment message for interbank transfers',
  category: 'Financial Institution Transfers',
  fields: [
    { tag: '20', name: 'Transaction Reference Number', mandatory: true, format: '16x', description: 'Unique reference assigned by sender', maxLength: 16 },
    { tag: '21', name: 'Related Reference', mandatory: true, format: '16x', description: 'Reference to related transaction', maxLength: 16 },
    { tag: '13C', name: 'Time Indication', mandatory: false, format: '/8c/4!n1!x4!n', description: 'Time indication' },
    { tag: '32A', name: 'Value Date/Currency/Amount', mandatory: true, format: '6!n3!a15d', description: 'Value date, currency, and amount' },
    { tag: '52A', name: 'Ordering Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Ordering institution BIC' },
    { tag: '52D', name: 'Ordering Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Ordering institution name and address' },
    { tag: '53A', name: 'Sender\'s Correspondent (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Sender correspondent BIC' },
    { tag: '53B', name: 'Sender\'s Correspondent (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Sender correspondent location' },
    { tag: '53D', name: 'Sender\'s Correspondent (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Sender correspondent name and address' },
    { tag: '54A', name: 'Receiver\'s Correspondent (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Receiver correspondent BIC' },
    { tag: '54B', name: 'Receiver\'s Correspondent (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Receiver correspondent location' },
    { tag: '54D', name: 'Receiver\'s Correspondent (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Receiver correspondent name and address' },
    { tag: '56A', name: 'Intermediary (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Intermediary institution BIC' },
    { tag: '56D', name: 'Intermediary (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Intermediary institution name and address' },
    { tag: '57A', name: 'Account With Institution (BIC)', mandatory: false, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Account with institution BIC' },
    { tag: '57B', name: 'Account With Institution (Location)', mandatory: false, format: '[/1!a][/34x][35x]', description: 'Account with institution location' },
    { tag: '57D', name: 'Account With Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Account with institution name and address' },
    { tag: '58A', name: 'Beneficiary Institution (BIC)', mandatory: true, format: '[/1!a][/34x]4!a2!a2!c[3!c]', description: 'Beneficiary institution BIC' },
    { tag: '58D', name: 'Beneficiary Institution (Name/Address)', mandatory: false, format: '[/1!a][/34x]4*35x', description: 'Beneficiary institution name and address' },
    { tag: '72', name: 'Sender to Receiver Information', mandatory: false, format: '6*35x', description: 'Additional information', maxLength: 210 },
  ],
};

/**
 * MT940 - Customer Statement Message
 */
export const MT940_SPEC: MtMessageSpec = {
  type: 'MT940',
  name: 'Customer Statement Message',
  description: 'End-of-day statement providing transaction details for customer account',
  category: 'Cash Management',
  fields: [
    { tag: '20', name: 'Transaction Reference Number', mandatory: true, format: '16x', description: 'Statement reference', maxLength: 16 },
    { tag: '21', name: 'Related Reference', mandatory: false, format: '16x', description: 'Related reference if applicable', maxLength: 16 },
    { tag: '25', name: 'Account Identification', mandatory: true, format: '35x', description: 'Account number', maxLength: 35 },
    { tag: '25P', name: 'Account Identification (Party)', mandatory: false, format: '35x4!a2!a2!c[3!c]', description: 'Account with identifier type' },
    { tag: '28C', name: 'Statement Number/Sequence Number', mandatory: true, format: '5n[/5n]', description: 'Statement number and sequence' },
    { tag: '60F', name: 'Opening Balance (First)', mandatory: true, format: '1!a6!n3!a15d', description: 'First opening balance' },
    { tag: '60M', name: 'Opening Balance (Intermediate)', mandatory: false, format: '1!a6!n3!a15d', description: 'Intermediate opening balance' },
    { tag: '61', name: 'Statement Line', mandatory: false, format: '6!n[4!n]2a[1!a]15d1!a3!c16x[//16x][34x]', description: 'Individual transaction line' },
    { tag: '62F', name: 'Closing Balance (Final)', mandatory: true, format: '1!a6!n3!a15d', description: 'Final closing balance' },
    { tag: '62M', name: 'Closing Balance (Intermediate)', mandatory: false, format: '1!a6!n3!a15d', description: 'Intermediate closing balance' },
    { tag: '64', name: 'Closing Available Balance', mandatory: false, format: '1!a6!n3!a15d', description: 'Available balance at close' },
    { tag: '65', name: 'Forward Available Balance', mandatory: false, format: '1!a6!n3!a15d', description: 'Future dated available balance' },
    { tag: '86', name: 'Information to Account Owner', mandatory: false, format: '6*65x', description: 'Transaction details', maxLength: 390 },
  ],
};

/**
 * MT950 - Statement Message
 */
export const MT950_SPEC: MtMessageSpec = {
  type: 'MT950',
  name: 'Statement Message',
  description: 'Statement message without transaction narratives (netting)',
  category: 'Cash Management',
  fields: [
    { tag: '20', name: 'Transaction Reference Number', mandatory: true, format: '16x', description: 'Statement reference', maxLength: 16 },
    { tag: '25', name: 'Account Identification', mandatory: true, format: '35x', description: 'Account number', maxLength: 35 },
    { tag: '28C', name: 'Statement Number/Sequence Number', mandatory: true, format: '5n[/5n]', description: 'Statement number and sequence' },
    { tag: '60F', name: 'Opening Balance (First)', mandatory: true, format: '1!a6!n3!a15d', description: 'First opening balance' },
    { tag: '60M', name: 'Opening Balance (Intermediate)', mandatory: false, format: '1!a6!n3!a15d', description: 'Intermediate opening balance' },
    { tag: '61', name: 'Statement Line', mandatory: false, format: '6!n[4!n]2a[1!a]15d1!a3!c16x[//16x]', description: 'Individual transaction line' },
    { tag: '62F', name: 'Closing Balance (Final)', mandatory: true, format: '1!a6!n3!a15d', description: 'Final closing balance' },
    { tag: '62M', name: 'Closing Balance (Intermediate)', mandatory: false, format: '1!a6!n3!a15d', description: 'Intermediate closing balance' },
    { tag: '64', name: 'Closing Available Balance', mandatory: false, format: '1!a6!n3!a15d', description: 'Available balance at close' },
  ],
};

/**
 * All MT message specifications
 */
export const MT_SPECS: Record<string, MtMessageSpec> = {
  MT103: MT103_SPEC,
  MT202: MT202_SPEC,
  MT940: MT940_SPEC,
  MT950: MT950_SPEC,
};

/**
 * Bank operation codes for MT103
 */
export const BANK_OPERATION_CODES: Record<string, string> = {
  CRED: 'Credit Transfer',
  CRTS: 'Credit Transfer for Test',
  SPAY: 'Single Payment',
  SPRI: 'Priority Payment',
  SSTD: 'Standard Payment',
};

/**
 * Charge details codes
 */
export const CHARGE_CODES: Record<string, string> = {
  BEN: 'All charges paid by beneficiary',
  OUR: 'All charges paid by ordering customer',
  SHA: 'Charges shared between ordering customer and beneficiary',
};

/**
 * Transaction type codes for statement entries
 */
export const TRANSACTION_TYPE_CODES: Record<string, string> = {
  S: 'SWIFT transfer',
  N: 'Non-SWIFT transfer',
  F: 'First advice',
};

/**
 * Credit/Debit indicators
 */
export const CREDIT_DEBIT_CODES: Record<string, string> = {
  C: 'Credit',
  D: 'Debit',
  RC: 'Reversal Credit',
  RD: 'Reversal Debit',
};
