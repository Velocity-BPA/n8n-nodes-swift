/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface BicEntry {
  bic: string;
  institution: string;
  branch?: string;
  city: string;
  country: string;
  countryCode: string;
  address?: string;
  isHeadquarters: boolean;
}

/**
 * BIC/SWIFT Directory containing major global financial institutions.
 * This is a representative subset for demonstration and validation purposes.
 */
export const BIC_DIRECTORY: BicEntry[] = [
  // United States
  { bic: 'CHASUS33XXX', institution: 'JPMorgan Chase Bank', city: 'New York', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'BOFAUS3NXXX', institution: 'Bank of America', city: 'Charlotte', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'CITIUS33XXX', institution: 'Citibank', city: 'New York', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'WFBIUS6SXXX', institution: 'Wells Fargo Bank', city: 'San Francisco', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'GSLOGSMMXXX', institution: 'Goldman Sachs', city: 'New York', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'MRMDUS33XXX', institution: 'Morgan Stanley', city: 'New York', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'USBKUS44XXX', institution: 'U.S. Bank', city: 'Minneapolis', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'PNCCUS33XXX', institution: 'PNC Bank', city: 'Pittsburgh', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'TRWIUS33XXX', institution: 'Truist Bank', city: 'Charlotte', country: 'United States', countryCode: 'US', isHeadquarters: true },
  { bic: 'TABORWMXXX', institution: 'TD Bank', city: 'Wilmington', country: 'United States', countryCode: 'US', isHeadquarters: false },

  // United Kingdom
  { bic: 'BABORWMXXX', institution: 'Barclays Bank', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'HABORWMXXX', institution: 'HSBC UK', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'NWBKGB2LXXX', institution: 'NatWest Bank', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'LOYDGB2LXXX', institution: 'Lloyds Bank', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'RABORWMXXX', institution: 'Royal Bank of Scotland', city: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'SCFBGB2LXXX', institution: 'Santander UK', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },
  { bic: 'MIDLGB22XXX', institution: 'HSBC Bank', city: 'London', country: 'United Kingdom', countryCode: 'GB', isHeadquarters: true },

  // Germany
  { bic: 'COBADEFFXXX', institution: 'Commerzbank', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', isHeadquarters: true },
  { bic: 'DEUTDEFFXXX', institution: 'Deutsche Bank', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', isHeadquarters: true },
  { bic: 'HYVEDEMM400', institution: 'UniCredit Bank (HypoVereinsbank)', city: 'Munich', country: 'Germany', countryCode: 'DE', isHeadquarters: true },
  { bic: 'DRESDEFF250', institution: 'Commerzbank (former Dresdner)', city: 'Dresden', country: 'Germany', countryCode: 'DE', isHeadquarters: false },
  { bic: 'SOGEDEFFXXX', institution: 'Société Générale Germany', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', isHeadquarters: false },

  // France
  { bic: 'BNPAFRPPXXX', institution: 'BNP Paribas', city: 'Paris', country: 'France', countryCode: 'FR', isHeadquarters: true },
  { bic: 'SOGEFRPPXXX', institution: 'Société Générale', city: 'Paris', country: 'France', countryCode: 'FR', isHeadquarters: true },
  { bic: 'CRLYFRPPXXX', institution: 'Crédit Lyonnais (LCL)', city: 'Paris', country: 'France', countryCode: 'FR', isHeadquarters: true },
  { bic: 'AGRIFRPPXXX', institution: 'Crédit Agricole', city: 'Paris', country: 'France', countryCode: 'FR', isHeadquarters: true },
  { bic: 'CEPAFRPP751', institution: 'Caisse d\'Épargne Île-de-France', city: 'Paris', country: 'France', countryCode: 'FR', isHeadquarters: false },

  // Switzerland
  { bic: 'UBSWCHZH80A', institution: 'UBS Switzerland', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', isHeadquarters: true },
  { bic: 'CRABORWMXXX', institution: 'Credit Suisse', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', isHeadquarters: true },
  { bic: 'ZKBKCHZZ80A', institution: 'Zürcher Kantonalbank', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', isHeadquarters: true },
  { bic: 'RAABORWMXXX', institution: 'Raiffeisen Switzerland', city: 'St. Gallen', country: 'Switzerland', countryCode: 'CH', isHeadquarters: true },

  // Japan
  { bic: 'MABORWMXXX', institution: 'MUFG Bank', city: 'Tokyo', country: 'Japan', countryCode: 'JP', isHeadquarters: true },
  { bic: 'SMBCJPJTXXX', institution: 'Sumitomo Mitsui Banking', city: 'Tokyo', country: 'Japan', countryCode: 'JP', isHeadquarters: true },
  { bic: 'MIABORWMXXX', institution: 'Mizuho Bank', city: 'Tokyo', country: 'Japan', countryCode: 'JP', isHeadquarters: true },
  { bic: 'NORINCHUBN', institution: 'Norinchukin Bank', city: 'Tokyo', country: 'Japan', countryCode: 'JP', isHeadquarters: true },

  // China
  { bic: 'ICBKCNBJXXX', institution: 'Industrial and Commercial Bank of China', city: 'Beijing', country: 'China', countryCode: 'CN', isHeadquarters: true },
  { bic: 'CCABORWMXXX', institution: 'China Construction Bank', city: 'Beijing', country: 'China', countryCode: 'CN', isHeadquarters: true },
  { bic: 'ABOCCNBJXXX', institution: 'Agricultural Bank of China', city: 'Beijing', country: 'China', countryCode: 'CN', isHeadquarters: true },
  { bic: 'BKCHCNBJXXX', institution: 'Bank of China', city: 'Beijing', country: 'China', countryCode: 'CN', isHeadquarters: true },
  { bic: 'CABORWMXXX', institution: 'China Merchants Bank', city: 'Shenzhen', country: 'China', countryCode: 'CN', isHeadquarters: true },

  // Canada
  { bic: 'ROYCCAT2XXX', institution: 'Royal Bank of Canada', city: 'Toronto', country: 'Canada', countryCode: 'CA', isHeadquarters: true },
  { bic: 'TDOMCATTTOR', institution: 'Toronto-Dominion Bank', city: 'Toronto', country: 'Canada', countryCode: 'CA', isHeadquarters: true },
  { bic: 'BABORWMXXX', institution: 'Bank of Nova Scotia', city: 'Toronto', country: 'Canada', countryCode: 'CA', isHeadquarters: true },
  { bic: 'BMOCABORWM', institution: 'Bank of Montreal', city: 'Montreal', country: 'Canada', countryCode: 'CA', isHeadquarters: true },
  { bic: 'CIBCCATTXXX', institution: 'Canadian Imperial Bank of Commerce', city: 'Toronto', country: 'Canada', countryCode: 'CA', isHeadquarters: true },

  // Australia
  { bic: 'CTBAAU2SXXX', institution: 'Commonwealth Bank of Australia', city: 'Sydney', country: 'Australia', countryCode: 'AU', isHeadquarters: true },
  { bic: 'NATAAU3303M', institution: 'National Australia Bank', city: 'Melbourne', country: 'Australia', countryCode: 'AU', isHeadquarters: true },
  { bic: 'ANZBAU3MXXX', institution: 'ANZ Bank', city: 'Melbourne', country: 'Australia', countryCode: 'AU', isHeadquarters: true },
  { bic: 'WPACAU2SXXX', institution: 'Westpac Banking Corporation', city: 'Sydney', country: 'Australia', countryCode: 'AU', isHeadquarters: true },

  // Singapore
  { bic: 'DBSSSGSGXXX', institution: 'DBS Bank', city: 'Singapore', country: 'Singapore', countryCode: 'SG', isHeadquarters: true },
  { bic: 'OCBCSGSGXXX', institution: 'OCBC Bank', city: 'Singapore', country: 'Singapore', countryCode: 'SG', isHeadquarters: true },
  { bic: 'UABORWMXXX', institution: 'United Overseas Bank', city: 'Singapore', country: 'Singapore', countryCode: 'SG', isHeadquarters: true },

  // Hong Kong
  { bic: 'HSBCHKHHHKH', institution: 'HSBC Hong Kong', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', isHeadquarters: true },
  { bic: 'SCBLHKHHXXX', institution: 'Standard Chartered Hong Kong', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', isHeadquarters: true },
  { bic: 'BABORWMXXX', institution: 'Bank of China Hong Kong', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', isHeadquarters: true },

  // Netherlands
  { bic: 'ABNANL2AXXX', institution: 'ABN AMRO Bank', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', isHeadquarters: true },
  { bic: 'INGBNL2AXXX', institution: 'ING Bank', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', isHeadquarters: true },
  { bic: 'RABONL2UXXX', institution: 'Rabobank', city: 'Utrecht', country: 'Netherlands', countryCode: 'NL', isHeadquarters: true },

  // Spain
  { bic: 'BBABORWMXXX', institution: 'BBVA', city: 'Madrid', country: 'Spain', countryCode: 'ES', isHeadquarters: true },
  { bic: 'CAIXESBBXXX', institution: 'CaixaBank', city: 'Barcelona', country: 'Spain', countryCode: 'ES', isHeadquarters: true },
  { bic: 'BSCHESMM', institution: 'Banco Santander', city: 'Madrid', country: 'Spain', countryCode: 'ES', isHeadquarters: true },

  // Italy
  { bic: 'UNABORWMXXX', institution: 'UniCredit', city: 'Milan', country: 'Italy', countryCode: 'IT', isHeadquarters: true },
  { bic: 'ISABORWMXXX', institution: 'Intesa Sanpaolo', city: 'Turin', country: 'Italy', countryCode: 'IT', isHeadquarters: true },
  { bic: 'BCITITMM', institution: 'Banca Intesa', city: 'Milan', country: 'Italy', countryCode: 'IT', isHeadquarters: true },

  // India
  { bic: 'SBININBBXXX', institution: 'State Bank of India', city: 'Mumbai', country: 'India', countryCode: 'IN', isHeadquarters: true },
  { bic: 'HDFCINBBXXX', institution: 'HDFC Bank', city: 'Mumbai', country: 'India', countryCode: 'IN', isHeadquarters: true },
  { bic: 'ABORWMINBXX', institution: 'ICICI Bank', city: 'Mumbai', country: 'India', countryCode: 'IN', isHeadquarters: true },
  { bic: 'AXISINBBXXX', institution: 'Axis Bank', city: 'Mumbai', country: 'India', countryCode: 'IN', isHeadquarters: true },

  // Brazil
  { bic: 'BRAABORWMXX', institution: 'Banco do Brasil', city: 'Brasília', country: 'Brazil', countryCode: 'BR', isHeadquarters: true },
  { bic: 'ITAUBRSPXXX', institution: 'Itaú Unibanco', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', isHeadquarters: true },
  { bic: 'BDOBOBORWMX', institution: 'Bradesco', city: 'Osasco', country: 'Brazil', countryCode: 'BR', isHeadquarters: true },

  // UAE
  { bic: 'EABORWMAEAD', institution: 'Emirates NBD', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', isHeadquarters: true },
  { bic: 'NBABORWMAXX', institution: 'First Abu Dhabi Bank', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', isHeadquarters: true },

  // South Africa
  { bic: 'SBZAZAJJXXX', institution: 'Standard Bank', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', isHeadquarters: true },
  { bic: 'ABSAZAJJXXX', institution: 'Absa Bank', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', isHeadquarters: true },
  { bic: 'FABORWMZAJJ', institution: 'First National Bank', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', isHeadquarters: true },

  // South Korea
  { bic: 'KSABKRSE', institution: 'KB Kookmin Bank', city: 'Seoul', country: 'South Korea', countryCode: 'KR', isHeadquarters: true },
  { bic: 'SBABORWMXXX', institution: 'Shinhan Bank', city: 'Seoul', country: 'South Korea', countryCode: 'KR', isHeadquarters: true },
  { bic: 'WABORWMKXXX', institution: 'Woori Bank', city: 'Seoul', country: 'South Korea', countryCode: 'KR', isHeadquarters: true },
];

/**
 * Country code to country name mapping
 */
export const COUNTRY_CODES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CH: 'Switzerland',
  JP: 'Japan',
  CN: 'China',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  HK: 'Hong Kong',
  NL: 'Netherlands',
  ES: 'Spain',
  IT: 'Italy',
  IN: 'India',
  BR: 'Brazil',
  AE: 'United Arab Emirates',
  ZA: 'South Africa',
  KR: 'South Korea',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  AT: 'Austria',
  BE: 'Belgium',
  IE: 'Ireland',
  PT: 'Portugal',
  PL: 'Poland',
  CZ: 'Czech Republic',
  RU: 'Russia',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  NZ: 'New Zealand',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  KW: 'Kuwait',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
};
