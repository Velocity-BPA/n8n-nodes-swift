/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { AmountFormatOptions, ReferenceGenerationOptions, DateFormatOptions } from './types';

/**
 * Format amount for SWIFT (comma as decimal separator)
 */
export function formatSwiftAmount(
  amount: number | string,
  options: AmountFormatOptions = {}
): string {
  const { decimalPlaces = 2, useSwiftFormat = true } = options;
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  // Format to fixed decimal places
  const formatted = numAmount.toFixed(decimalPlaces);
  
  // SWIFT uses comma as decimal separator
  if (useSwiftFormat) {
    return formatted.replace('.', ',');
  }
  
  return formatted;
}

/**
 * Parse SWIFT amount (comma as decimal separator) to number
 */
export function parseSwiftAmount(swiftAmount: string): number {
  // Handle SWIFT format (comma as decimal separator)
  const normalized = swiftAmount
    .replace(/\s/g, '')  // Remove spaces
    .replace(',', '.');  // Replace comma with dot
  
  const amount = parseFloat(normalized);
  
  if (isNaN(amount)) {
    throw new Error(`Invalid SWIFT amount: ${swiftAmount}`);
  }
  
  return amount;
}

/**
 * Format amount with currency prefix
 */
export function formatAmountWithCurrency(
  amount: number | string,
  currency: string,
  options: AmountFormatOptions = {}
): string {
  const formattedAmount = formatSwiftAmount(amount, options);
  return `${currency}${formattedAmount}`;
}

/**
 * Format date for SWIFT (YYMMDD)
 */
export function formatSwiftDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  const year = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Parse SWIFT date (YYMMDD) to Date object
 */
export function parseSwiftDate(swiftDate: string): Date {
  if (!/^\d{6}$/.test(swiftDate)) {
    throw new Error(`Invalid SWIFT date format: ${swiftDate}. Expected YYMMDD.`);
  }
  
  const year = parseInt(swiftDate.slice(0, 2), 10);
  const month = parseInt(swiftDate.slice(2, 4), 10) - 1;
  const day = parseInt(swiftDate.slice(4, 6), 10);
  
  // Assume 20xx for years 00-50, 19xx for years 51-99
  const fullYear = year <= 50 ? 2000 + year : 1900 + year;
  
  const date = new Date(fullYear, month, day);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid SWIFT date: ${swiftDate}`);
  }
  
  return date;
}

/**
 * Format date according to specified format
 */
export function formatDate(date: Date | string, options: DateFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  switch (options.format) {
    case 'swift':
    case 'yymmdd':
      return formatSwiftDate(d);
    
    case 'yyyymmdd': {
      const year = d.getFullYear().toString();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}${month}${day}`;
    }
    
    case 'iso':
    default:
      return d.toISOString();
  }
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
 * Generate a reference based on options
 */
export function generateReference(options: ReferenceGenerationOptions): string {
  const { type, prefix = '', includeTimestamp = true } = options;

  switch (type) {
    case 'uetr':
      return generateUetr();
    
    case 'message': {
      // 16-character message reference
      const timestamp = includeTimestamp ? Date.now().toString(36).toUpperCase() : '';
      const random = Math.random().toString(36).substring(2, 10).toUpperCase();
      const ref = prefix + timestamp + random;
      return ref.slice(0, 16).padEnd(16, '0');
    }
    
    case 'transaction': {
      // Transaction reference with optional prefix
      const timestamp = includeTimestamp ? Date.now().toString(36).toUpperCase() : '';
      const random = Math.random().toString(36).substring(2, 12).toUpperCase();
      const ref = prefix + timestamp + random;
      return ref.slice(0, 35); // Max 35 chars
    }
    
    default:
      throw new Error(`Unknown reference type: ${type}`);
  }
}

/**
 * Validate currency code (ISO 4217)
 */
export function validateCurrencyCode(currency: string): boolean {
  // ISO 4217 currency codes are 3 uppercase letters
  return /^[A-Z]{3}$/.test(currency);
}

/**
 * Common ISO 4217 currency codes
 */
export const CURRENCY_CODES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  NZD: 'New Zealand Dollar',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  ZAR: 'South African Rand',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  PLN: 'Polish Zloty',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ILS: 'Israeli Shekel',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RON: 'Romanian Leu',
};

/**
 * Format SWIFT balance (C/D indicator + date + currency + amount)
 */
export function formatSwiftBalance(
  creditDebit: 'C' | 'D',
  date: Date | string,
  currency: string,
  amount: number | string
): string {
  const formattedDate = formatSwiftDate(date);
  const formattedAmount = formatSwiftAmount(amount);
  return `${creditDebit}${formattedDate}${currency}${formattedAmount}`;
}

/**
 * Parse SWIFT balance string
 */
export function parseSwiftBalance(balance: string): {
  creditDebit: 'C' | 'D';
  date: Date;
  currency: string;
  amount: number;
} {
  const match = balance.match(/^([CD])(\d{6})([A-Z]{3})([\d,]+)$/);
  
  if (!match) {
    throw new Error(`Invalid SWIFT balance format: ${balance}`);
  }
  
  return {
    creditDebit: match[1] as 'C' | 'D',
    date: parseSwiftDate(match[2]),
    currency: match[3],
    amount: parseSwiftAmount(match[4]),
  };
}

/**
 * Truncate string to maximum length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength);
}

/**
 * Split string into lines of maximum length
 */
export function splitIntoLines(str: string, maxLineLength: number): string[] {
  const lines: string[] = [];
  let remaining = str;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLineLength) {
      lines.push(remaining);
      break;
    }
    
    // Try to split at a space
    let splitIndex = remaining.lastIndexOf(' ', maxLineLength);
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = maxLineLength;
    }
    
    lines.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trim();
  }
  
  return lines;
}

/**
 * Sanitize string for SWIFT (remove invalid characters)
 */
export function sanitizeForSwift(str: string): string {
  // SWIFT character set: A-Z, a-z, 0-9, / - ? : ( ) . , ' + space
  return str.replace(/[^A-Za-z0-9\/\-?:().,' +]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if string contains only valid SWIFT characters
 */
export function isValidSwiftString(str: string): boolean {
  return /^[A-Za-z0-9\/\-?:().,' +\r\n]*$/.test(str);
}
