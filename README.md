# n8n-nodes-swift

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for SWIFT financial messaging. Parse, generate, and validate MT/MX messages, validate BIC/SWIFT codes, and work with IBANs.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)

## Features

- **MT Message Processing**: Parse, generate, and validate SWIFT MT messages (MT103, MT202, MT940, MT950)
- **MX Message Processing**: Parse and validate ISO 20022 MX/XML messages (pacs.008, camt.053, pain.001)
- **BIC/SWIFT Validation**: Validate BIC codes with directory lookup for 80+ major global banks
- **IBAN Utilities**: Validate, parse, generate, and format IBANs for 30+ countries
- **SWIFT Utilities**: Format amounts, parse dates, generate references, sanitize text

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Search for `n8n-nodes-swift`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-swift

# Restart n8n
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-swift

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-swift

# Restart n8n
n8n start
```

## Resources & Operations

### MT Message

| Operation | Description |
|-----------|-------------|
| Parse | Parse an MT message into structured JSON data |
| Generate | Generate an MT message from input data |
| Validate | Validate an MT message structure and content |

**Supported Message Types:**
- MT103 - Single Customer Credit Transfer
- MT202 - General Financial Institution Transfer
- MT940 - Customer Statement Message
- MT950 - Statement Message

### MX Message

| Operation | Description |
|-----------|-------------|
| Parse | Parse ISO 20022 MX/XML message into structured data |
| Validate | Validate MX message structure |

**Supported Message Types:**
- pacs.008 - FI to FI Customer Credit Transfer
- pacs.009 - FI to FI Financial Institution Credit Transfer
- pacs.002 - Payment Status Report
- camt.053 - Bank to Customer Statement
- camt.054 - Bank to Customer Debit/Credit Notification
- pain.001 - Customer Credit Transfer Initiation

### BIC

| Operation | Description |
|-----------|-------------|
| Validate | Validate BIC/SWIFT code format |
| Lookup | Lookup BIC details from directory (80+ banks) |
| Search | Search for BICs by institution name |
| Parse | Parse BIC into components |

### IBAN

| Operation | Description |
|-----------|-------------|
| Validate | Validate IBAN with checksum verification |
| Parse | Parse IBAN into components |
| Generate | Generate IBAN from country, bank, and account |
| Format | Format IBAN for display (groups of 4) |

**Supported Countries:** DE, FR, GB, ES, IT, NL, BE, AT, CH, PT, IE, LU, FI, NO, SE, DK, PL, CZ, HU, SK, SI, HR, RO, BG, GR, CY, MT, EE, LT, LV, and more.

### Utilities

| Operation | Description |
|-----------|-------------|
| Format Amount | Format number for SWIFT (comma decimal) |
| Parse Amount | Parse SWIFT amount to number |
| Format Date | Format date for SWIFT (YYMMDD/YYYYMMDD) |
| Parse Date | Parse SWIFT date string |
| Generate Reference | Generate unique SWIFT reference |
| Sanitize Text | Sanitize text for SWIFT messages |

## Usage Examples

### Parse MT103 Message

```javascript
// Input: Raw MT103 message
{1:F01CHASUS33XXXX0000000000}{2:O1031230210315DEUTDEFFXXXX00000000002103151230N}{4:
:20:TXN123456
:23B:CRED
:32A:210315USD10000,00
:50K:/DE89370400440532013000
JOHN DOE
123 MAIN STREET
:59:/GB29NWBK60161331926819
JANE SMITH
456 OAK AVENUE
:71A:SHA
-}

// Output: Structured JSON with all parsed fields
```

### Validate IBAN

```javascript
// Input: DE89370400440532013000
// Output: { valid: true, countryCode: "DE", checkDigits: "89", ... }
```

### Generate MT103

Configure the node with sender BIC, receiver BIC, amount, currency, and parties to generate a complete MT103 message.

## SWIFT Concepts

### MT Messages (FIN)
MT messages are the traditional SWIFT message format using a tag-based structure with 5 blocks. Each field is identified by a tag number (e.g., :20: for reference, :32A: for amount).

### MX Messages (ISO 20022)
MX messages use XML format following ISO 20022 standards. They provide richer data structures and are part of SWIFT's migration to the universal messaging standard.

### BIC/SWIFT Codes
Bank Identifier Codes (BIC) are 8 or 11 character codes identifying financial institutions:
- Positions 1-4: Institution code
- Positions 5-6: Country code
- Positions 7-8: Location code
- Positions 9-11: Branch code (optional, XXX = head office)

### IBAN
International Bank Account Numbers combine country code, check digits, and Basic Bank Account Number (BBAN) for standardized international account identification.

## Error Handling

The node provides detailed error information:
- Validation errors include specific field-level issues
- Parse errors identify malformed message sections
- All operations return structured results with success/failure indicators

## Security Best Practices

- Never log complete SWIFT messages in production
- Validate all BIC and IBAN inputs before processing
- Use secure connections when transmitting financial data
- Store sensitive data encrypted at rest

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/Velocity-BPA/n8n-nodes-swift/issues)
- Email: licensing@velobpa.com

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [SWIFT](https://www.swift.com) - Financial messaging standards
- [ISO 20022](https://www.iso20022.org) - Universal financial messaging standard
