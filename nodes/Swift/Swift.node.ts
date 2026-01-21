/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { validateBic, lookupBic, searchBic, parseBic, normalizeBic } from './utils/bicValidator';
import { validateIban, parseIban, generateIban, formatIban } from './utils/ibanValidator';
import { parseMtMessage, validateMtMessage } from './utils/mtParser';
import { generateMtMessage } from './utils/mtGenerator';
import { parseMxMessage, validateMxMessage } from './utils/mxParser';
import {
	formatSwiftAmount,
	parseSwiftAmount,
	formatSwiftDate,
	formatDate,
	parseSwiftDate,
	generateReference,
	sanitizeForSwift,
} from './utils/common';
import type { IDataObject } from 'n8n-workflow';

// Emit licensing notice once per node load
const LICENSING_NOTICE_EMITTED = false;
if (!LICENSING_NOTICE_EMITTED) {
	console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
}

export class Swift implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SWIFT',
		name: 'swift',
		icon: 'file:swift.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Parse, generate, and validate SWIFT messages (MT/MX), BIC codes, and IBANs',
		defaults: {
			name: 'SWIFT',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'MT Message',
						value: 'mtMessage',
						description: 'Work with SWIFT MT (FIN) messages',
					},
					{
						name: 'MX Message',
						value: 'mxMessage',
						description: 'Work with ISO 20022 MX (XML) messages',
					},
					{
						name: 'BIC',
						value: 'bic',
						description: 'Validate and lookup BIC/SWIFT codes',
					},
					{
						name: 'IBAN',
						value: 'iban',
						description: 'Validate, parse, and generate IBANs',
					},
					{
						name: 'Utilities',
						value: 'utilities',
						description: 'SWIFT utility functions',
					},
				],
				default: 'mtMessage',
			},

			// MT Message Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
					},
				},
				options: [
					{
						name: 'Parse',
						value: 'parse',
						description: 'Parse an MT message into structured data',
						action: 'Parse an MT message',
					},
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate an MT message from data',
						action: 'Generate an MT message',
					},
					{
						name: 'Validate',
						value: 'validate',
						description: 'Validate an MT message',
						action: 'Validate an MT message',
					},
				],
				default: 'parse',
			},

			// MX Message Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['mxMessage'],
					},
				},
				options: [
					{
						name: 'Parse',
						value: 'parse',
						description: 'Parse an MX (ISO 20022) message into structured data',
						action: 'Parse an MX message',
					},
					{
						name: 'Validate',
						value: 'validate',
						description: 'Validate an MX message',
						action: 'Validate an MX message',
					},
				],
				default: 'parse',
			},

			// BIC Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bic'],
					},
				},
				options: [
					{
						name: 'Validate',
						value: 'validate',
						description: 'Validate a BIC/SWIFT code',
						action: 'Validate a BIC code',
					},
					{
						name: 'Lookup',
						value: 'lookup',
						description: 'Lookup BIC details from directory',
						action: 'Lookup BIC details',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for BICs by institution name',
						action: 'Search for BICs',
					},
					{
						name: 'Parse',
						value: 'parse',
						description: 'Parse BIC into components',
						action: 'Parse a BIC code',
					},
				],
				default: 'validate',
			},

			// IBAN Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['iban'],
					},
				},
				options: [
					{
						name: 'Validate',
						value: 'validate',
						description: 'Validate an IBAN',
						action: 'Validate an IBAN',
					},
					{
						name: 'Parse',
						value: 'parse',
						description: 'Parse IBAN into components',
						action: 'Parse an IBAN',
					},
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate an IBAN from components',
						action: 'Generate an IBAN',
					},
					{
						name: 'Format',
						value: 'format',
						description: 'Format an IBAN for display',
						action: 'Format an IBAN',
					},
				],
				default: 'validate',
			},

			// Utilities Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['utilities'],
					},
				},
				options: [
					{
						name: 'Format Amount',
						value: 'formatAmount',
						description: 'Format amount for SWIFT messages',
						action: 'Format amount for SWIFT',
					},
					{
						name: 'Parse Amount',
						value: 'parseAmount',
						description: 'Parse SWIFT amount to number',
						action: 'Parse SWIFT amount',
					},
					{
						name: 'Format Date',
						value: 'formatDate',
						description: 'Format date for SWIFT messages',
						action: 'Format date for SWIFT',
					},
					{
						name: 'Parse Date',
						value: 'parseDate',
						description: 'Parse SWIFT date string',
						action: 'Parse SWIFT date',
					},
					{
						name: 'Generate Reference',
						value: 'generateReference',
						description: 'Generate a SWIFT reference number',
						action: 'Generate reference number',
					},
					{
						name: 'Sanitize Text',
						value: 'sanitizeText',
						description: 'Sanitize text for SWIFT messages',
						action: 'Sanitize text for SWIFT',
					},
				],
				default: 'formatAmount',
			},

			// ============ MT MESSAGE FIELDS ============

			// MT Parse fields
			{
				displayName: 'Message Content',
				name: 'messageContent',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['parse', 'validate'],
					},
				},
				description: 'The raw MT message content to parse or validate',
			},

			// MT Generate fields
			{
				displayName: 'Message Type',
				name: 'mtType',
				type: 'options',
				options: [
					{ name: 'MT103 - Single Customer Credit Transfer', value: 'MT103' },
					{ name: 'MT202 - General Financial Institution Transfer', value: 'MT202' },
					{ name: 'MT940 - Customer Statement Message', value: 'MT940' },
					{ name: 'MT950 - Statement Message', value: 'MT950' },
				],
				default: 'MT103',
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
					},
				},
				description: 'The type of MT message to generate',
			},
			{
				displayName: 'Sender BIC',
				name: 'senderBic',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
					},
				},
				description: 'The BIC of the sending institution',
			},
			{
				displayName: 'Receiver BIC',
				name: 'receiverBic',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
					},
				},
				description: 'The BIC of the receiving institution',
			},
			{
				displayName: 'Transaction Reference',
				name: 'transactionReference',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
					},
				},
				description: 'Unique transaction reference (Field 20). Leave empty to auto-generate.',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103', 'MT202'],
					},
				},
				description: 'Three-letter currency code (ISO 4217)',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103', 'MT202'],
					},
				},
				description: 'The transaction amount',
			},
			{
				displayName: 'Value Date',
				name: 'valueDate',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103', 'MT202'],
					},
				},
				description: 'Value date in YYYYMMDD format. Leave empty for today.',
			},
			{
				displayName: 'Ordering Customer',
				name: 'orderingCustomer',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103'],
					},
				},
				description: 'Ordering customer details (Field 50)',
			},
			{
				displayName: 'Beneficiary Customer',
				name: 'beneficiaryCustomer',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103'],
					},
				},
				description: 'Beneficiary customer details (Field 59)',
			},
			{
				displayName: 'Charges',
				name: 'charges',
				type: 'options',
				options: [
					{ name: 'OUR - All charges paid by sender', value: 'OUR' },
					{ name: 'SHA - Shared charges', value: 'SHA' },
					{ name: 'BEN - All charges paid by beneficiary', value: 'BEN' },
				],
				default: 'SHA',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT103'],
					},
				},
				description: 'Details of charges (Field 71A)',
			},
			{
				displayName: 'Account Number',
				name: 'accountNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT940', 'MT950'],
					},
				},
				description: 'Account identification (Field 25)',
			},
			{
				displayName: 'Statement Number',
				name: 'statementNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT940', 'MT950'],
					},
				},
				description: 'Statement number/sequence (Field 28C)',
			},
			{
				displayName: 'Opening Balance',
				name: 'openingBalance',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT940', 'MT950'],
					},
				},
				description: 'Opening balance amount',
			},
			{
				displayName: 'Closing Balance',
				name: 'closingBalance',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				displayOptions: {
					show: {
						resource: ['mtMessage'],
						operation: ['generate'],
						mtType: ['MT940', 'MT950'],
					},
				},
				description: 'Closing balance amount',
			},

			// ============ MX MESSAGE FIELDS ============
			{
				displayName: 'XML Content',
				name: 'xmlContent',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['mxMessage'],
						operation: ['parse', 'validate'],
					},
				},
				description: 'The ISO 20022 MX (XML) message content',
			},

			// ============ BIC FIELDS ============
			{
				displayName: 'BIC Code',
				name: 'bicCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['bic'],
						operation: ['validate', 'lookup', 'parse'],
					},
				},
				description: 'The BIC/SWIFT code (8 or 11 characters)',
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['bic'],
						operation: ['search'],
					},
				},
				description: 'Institution name or partial text to search',
			},
			{
				displayName: 'Country Filter',
				name: 'countryFilter',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['bic'],
						operation: ['search'],
					},
				},
				description: 'Filter results by country code (e.g., US, GB, DE)',
			},

			// ============ IBAN FIELDS ============
			{
				displayName: 'IBAN',
				name: 'iban',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['iban'],
						operation: ['validate', 'parse', 'format'],
					},
				},
				description: 'The IBAN to process',
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['iban'],
						operation: ['generate'],
					},
				},
				description: 'Two-letter ISO country code (e.g., DE, FR, GB)',
			},
			{
				displayName: 'Bank Code',
				name: 'bankCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['iban'],
						operation: ['generate'],
					},
				},
				description: 'National bank code',
			},
			{
				displayName: 'Account Number',
				name: 'accountNumberIban',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['iban'],
						operation: ['generate'],
					},
				},
				description: 'Account number',
			},

			// ============ UTILITIES FIELDS ============
			{
				displayName: 'Amount',
				name: 'utilAmount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['formatAmount'],
					},
				},
				description: 'Amount to format',
			},
			{
				displayName: 'Amount String',
				name: 'amountString',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['parseAmount'],
					},
				},
				description: 'SWIFT-formatted amount string (e.g., 1234,56)',
			},
			{
				displayName: 'Date',
				name: 'dateValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['formatDate'],
					},
				},
				description: 'Date to format (ISO format or leave empty for today)',
			},
			{
				displayName: 'Date Format',
				name: 'dateFormat',
				type: 'options',
				options: [
					{ name: 'YYMMDD (6 digits)', value: 'YYMMDD' },
					{ name: 'YYYYMMDD (8 digits)', value: 'YYYYMMDD' },
				],
				default: 'YYMMDD',
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['formatDate'],
					},
				},
				description: 'Output date format',
			},
			{
				displayName: 'Date String',
				name: 'dateString',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['parseDate'],
					},
				},
				description: 'SWIFT date string to parse (YYMMDD or YYYYMMDD)',
			},
			{
				displayName: 'Prefix',
				name: 'referencePrefix',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['generateReference'],
					},
				},
				description: 'Optional prefix for the reference',
			},
			{
				displayName: 'Text',
				name: 'textToSanitize',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['utilities'],
						operation: ['sanitizeText'],
					},
				},
				description: 'Text to sanitize for SWIFT messages',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject = {};

				// MT Message Operations
				if (resource === 'mtMessage') {
					if (operation === 'parse') {
						const messageContent = this.getNodeParameter('messageContent', i) as string;
						result = parseMtMessage(messageContent) as unknown as IDataObject;
					} else if (operation === 'generate') {
						const mtType = this.getNodeParameter('mtType', i) as string;
						const senderBic = this.getNodeParameter('senderBic', i) as string;
						const receiverBic = this.getNodeParameter('receiverBic', i) as string;
						let transactionReference = this.getNodeParameter('transactionReference', i) as string;

						if (!transactionReference) {
							transactionReference = generateReference({ type: 'message' });
						}

						const fields: Record<string, string | undefined> = {
							'20': transactionReference,
						};

						if (mtType === 'MT103' || mtType === 'MT202') {
							const currency = this.getNodeParameter('currency', i) as string;
							const amount = this.getNodeParameter('amount', i) as number;
							let valueDate = this.getNodeParameter('valueDate', i) as string;
							if (!valueDate) {
								valueDate = formatSwiftDate(new Date());
							}
							fields['32A'] = `${valueDate}${currency}${amount.toFixed(2).replace('.', ',')}`;

							if (mtType === 'MT103') {
								fields['23B'] = 'CRED';
								const orderingCustomer = this.getNodeParameter('orderingCustomer', i) as string;
								const beneficiaryCustomer = this.getNodeParameter('beneficiaryCustomer', i) as string;
								const charges = this.getNodeParameter('charges', i) as string;
								fields['50K'] = orderingCustomer;
								fields['59'] = beneficiaryCustomer;
								fields['71A'] = charges || 'SHA';
							}
						}

						if (mtType === 'MT940' || mtType === 'MT950') {
							const accountNumber = this.getNodeParameter('accountNumber', i) as string;
							const statementNumber = this.getNodeParameter('statementNumber', i) as string;
							const openingBalance = this.getNodeParameter('openingBalance', i) as number;
							const closingBalance = this.getNodeParameter('closingBalance', i) as number;
							fields['25'] = accountNumber;
							fields['28C'] = statementNumber || '1/1';
							const dateStr = formatSwiftDate(new Date());
							fields['60F'] = `C${dateStr}USD${openingBalance.toFixed(2).replace('.', ',')}`;
							fields['62F'] = `C${dateStr}USD${closingBalance.toFixed(2).replace('.', ',')}`;
						}

						const messageInput = {
							messageType: mtType,
							senderBic: normalizeBic(senderBic),
							receiverBic: normalizeBic(receiverBic),
							fields,
						};

						const generatedMessage = generateMtMessage(messageInput);
						result = { message: generatedMessage, ...messageInput } as IDataObject;
					} else if (operation === 'validate') {
						const messageContent = this.getNodeParameter('messageContent', i) as string;
						result = validateMtMessage(messageContent) as unknown as IDataObject;
					}
				}

				// MX Message Operations
				else if (resource === 'mxMessage') {
					if (operation === 'parse') {
						const xmlContent = this.getNodeParameter('xmlContent', i) as string;
						result = parseMxMessage(xmlContent) as unknown as IDataObject;
					} else if (operation === 'validate') {
						const xmlContent = this.getNodeParameter('xmlContent', i) as string;
						result = validateMxMessage(xmlContent) as unknown as IDataObject;
					}
				}

				// BIC Operations
				else if (resource === 'bic') {
					if (operation === 'validate') {
						const bicCode = this.getNodeParameter('bicCode', i) as string;
						result = validateBic(bicCode) as unknown as IDataObject;
					} else if (operation === 'lookup') {
						const bicCode = this.getNodeParameter('bicCode', i) as string;
						const lookupResult = lookupBic(bicCode);
						result = lookupResult as unknown as IDataObject;
					} else if (operation === 'search') {
						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						const countryFilter = this.getNodeParameter('countryFilter', i) as string;
						const searchResult = searchBic({ query: searchQuery, country: countryFilter || undefined });
						result = searchResult as unknown as IDataObject;
					} else if (operation === 'parse') {
						const bicCode = this.getNodeParameter('bicCode', i) as string;
						result = parseBic(bicCode) as unknown as IDataObject;
					}
				}

				// IBAN Operations
				else if (resource === 'iban') {
					if (operation === 'validate') {
						const iban = this.getNodeParameter('iban', i) as string;
						result = validateIban(iban) as unknown as IDataObject;
					} else if (operation === 'parse') {
						const iban = this.getNodeParameter('iban', i) as string;
						const parseResult = parseIban(iban);
						result = parseResult ? (parseResult as unknown as IDataObject) : { error: 'Invalid IBAN', iban };
					} else if (operation === 'generate') {
						const countryCode = this.getNodeParameter('countryCode', i) as string;
						const bankCode = this.getNodeParameter('bankCode', i) as string;
						const accountNumberIban = this.getNodeParameter('accountNumberIban', i) as string;
						const branchCode = this.getNodeParameter('branchCode', i, '') as string;
						result = generateIban({
							countryCode,
							bankCode,
							branchCode: branchCode || undefined,
							accountNumber: accountNumberIban,
						}) as unknown as IDataObject;
					} else if (operation === 'format') {
						const iban = this.getNodeParameter('iban', i) as string;
						const formatted = formatIban(iban);
						result = { original: iban, formatted };
					}
				}

				// Utilities Operations
				else if (resource === 'utilities') {
					if (operation === 'formatAmount') {
						const amount = this.getNodeParameter('utilAmount', i) as number;
						const formatted = formatSwiftAmount(amount);
						result = { original: amount, formatted };
					} else if (operation === 'parseAmount') {
						const amountString = this.getNodeParameter('amountString', i) as string;
						const parsed = parseSwiftAmount(amountString);
						result = { original: amountString, parsed };
					} else if (operation === 'formatDate') {
						const dateValue = this.getNodeParameter('dateValue', i) as string;
						const dateFormat = this.getNodeParameter('dateFormat', i) as string;
						const date = dateValue ? new Date(dateValue) : new Date();
						let formatted: string;
						if (dateFormat === 'YYYYMMDD' || dateFormat === 'yyyymmdd') {
							formatted = formatDate(date, { format: 'yyyymmdd' });
						} else {
							formatted = formatSwiftDate(date);
						}
						result = { original: dateValue || 'today', formatted, format: dateFormat };
					} else if (operation === 'parseDate') {
						const dateString = this.getNodeParameter('dateString', i) as string;
						const parsed = parseSwiftDate(dateString);
						result = { original: dateString, parsed: parsed.toISOString() };
					} else if (operation === 'generateReference') {
						const prefix = this.getNodeParameter('referencePrefix', i) as string;
						const referenceType = this.getNodeParameter('referenceType', i, 'message') as 'uetr' | 'message' | 'transaction';
						const reference = generateReference({ type: referenceType, prefix: prefix || undefined });
						result = { reference };
					} else if (operation === 'sanitizeText') {
						const text = this.getNodeParameter('textToSanitize', i) as string;
						const sanitized = sanitizeForSwift(text);
						result = { original: text, sanitized };
					}
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error occurred',
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error : new Error('Unknown error occurred'),
					{ itemIndex: i }
				);
			}
		}

		return [returnData];
	}
}
