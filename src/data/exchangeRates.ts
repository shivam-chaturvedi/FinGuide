export interface ExchangeRate {
  code: string;
  rate: number; // 1 SGD -> currency
  usdRate: number; // 1 USD -> currency (from API)
  lastUpdated: string;
  source: string;
}

const API_URL = "https://open.er-api.com/v6/latest/USD";
const API_SOURCE = "open.er-api.com";
const TARGET_CURRENCY_CODES = [
  "INR",
  "PHP",
  "CNY",
  "IDR",
  "BDT",
  "MMK",
  "THB",
  "VND",
  "MYR",
  "PKR"
];

interface ExchangeRateApiResponse {
  result: string;
  provider?: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

export interface ExchangeRateFetchResult {
  rates: ExchangeRate[];
  timestamp: string;
}

export async function fetchLiveExchangeRates(): Promise<ExchangeRateFetchResult> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates (${response.status})`);
  }

  const payload = (await response.json()) as ExchangeRateApiResponse;

  if (payload.result !== "success") {
    throw new Error("Exchange rate API did not return success");
  }

  const usdToSgd = payload.rates["SGD"];
  if (!usdToSgd) {
    throw new Error("Exchange rate payload missing SGD rate");
  }

  const timestamp = payload.time_last_update_utc
    ? new Date(payload.time_last_update_utc).toISOString()
    : new Date().toISOString();

  const rates = TARGET_CURRENCY_CODES.map((code) => {
    const usdRate = payload.rates[code] ?? 1;
    const sgdRate = usdRate / usdToSgd;
    return {
      code,
      usdRate: Number(usdRate.toFixed(6)),
      rate: Number(sgdRate.toFixed(6)),
      lastUpdated: timestamp,
      source: payload.provider ?? API_SOURCE
    };
  });

  return {
    rates,
    timestamp
  };
}
