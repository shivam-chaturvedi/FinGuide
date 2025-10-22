// Hardcoded exchange rates - updated as of January 2025
// Source: Yahoo Finance, Money Convert, CurrencyRate.Today

export interface ExchangeRate {
  currency: string;
  code: string;
  rate: number;
  flag: string;
  symbol: string;
  lastUpdated: string;
  source: string;
}

export const hardcodedExchangeRates: ExchangeRate[] = [
  {
    currency: "Indian Rupee",
    code: "INR",
    rate: 67.972,
    flag: "🇮🇳",
    symbol: "₹",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Money Convert"
  },
  {
    currency: "Philippine Peso",
    code: "PHP",
    rate: 44.933,
    flag: "🇵🇭",
    symbol: "₱",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Chinese Yuan",
    code: "CNY",
    rate: 5.5001,
    flag: "🇨🇳",
    symbol: "¥",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Indonesian Rupiah",
    code: "IDR",
    rate: 12786.488,
    flag: "🇮🇩",
    symbol: "Rp",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Thai Baht",
    code: "THB",
    rate: 25.1835,
    flag: "🇹🇭",
    symbol: "฿",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Vietnamese Dong",
    code: "VND",
    rate: 20264.900,
    flag: "🇻🇳",
    symbol: "₫",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Malaysian Ringgit",
    code: "MYR",
    rate: 3.2571,
    flag: "🇲🇾",
    symbol: "RM",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "Yahoo Finance"
  },
  {
    currency: "Pakistani Rupee",
    code: "PKR",
    rate: 218.18,
    flag: "🇵🇰",
    symbol: "₨",
    lastUpdated: "2025-01-17T12:00:00Z",
    source: "CurrencyRate.Today"
  }
];

export function getExchangeRate(currencyCode: string): number {
  const rate = hardcodedExchangeRates.find(r => r.code === currencyCode);
  return rate?.rate || 1;
}

export function getAllExchangeRates(): ExchangeRate[] {
  return hardcodedExchangeRates;
}

export function getSupportedCurrencies(): string[] {
  return hardcodedExchangeRates.map(rate => rate.code);
}

