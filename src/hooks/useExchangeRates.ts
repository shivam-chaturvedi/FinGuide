import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExchangeRate, fetchLiveExchangeRates } from '@/data/exchangeRates';

interface UseExchangeRatesReturn {
  rates: ExchangeRate[];
  loading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  getRateForCurrency: (currencyCode: string) => number;
  getUsdRateForCurrency: (currencyCode: string) => number;
  lastUpdated: string | null;
}

interface CachedExchangeRates {
  rates: ExchangeRate[];
  fetchedAt: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'finGuide.exchangeRates';
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

function loadCachedRates(): CachedExchangeRates | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached);
    if (
      parsed &&
      Array.isArray(parsed.rates) &&
      typeof parsed.fetchedAt === 'string' &&
      typeof parsed.lastUpdated === 'string'
    ) {
      const hasUsdRate = parsed.rates.every((rate: ExchangeRate) => typeof rate.usdRate === 'number');
      if (!hasUsdRate) {
        return null;
      }
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to decode cached exchange rates', error);
  }

  return null;
}

function persistCachedRates(snapshot: CachedExchangeRates) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to persist exchange rates cache', error);
  }
}

function needsRefresh(fetchedAt: string | null): boolean {
  if (!fetchedAt) {
    return true;
  }
  const age = Date.now() - new Date(fetchedAt).getTime();
  return age >= REFRESH_INTERVAL_MS;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const cachedSnapshot = useMemo(() => loadCachedRates(), []);
  const [rates, setRates] = useState<ExchangeRate[]>(cachedSnapshot?.rates ?? []);
  const [loading, setLoading] = useState(needsRefresh(cachedSnapshot?.fetchedAt ?? null));
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(cachedSnapshot?.lastUpdated ?? null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(cachedSnapshot?.fetchedAt ?? null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { rates: fetchedRates, timestamp } = await fetchLiveExchangeRates();
      const snapshot: CachedExchangeRates = {
        rates: fetchedRates,
        lastUpdated: timestamp,
        fetchedAt: new Date().toISOString()
      };

      setRates(fetchedRates);
      setLastUpdated(timestamp);
      setLastFetchedAt(snapshot.fetchedAt);
      persistCachedRates(snapshot);
    } catch (err) {
      console.error('Failed to load exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRates = useCallback(async () => {
    await fetchRates();
  }, [fetchRates]);

  const rateLookup = useMemo(() => {
    const map = new Map<string, number>();
    rates.forEach((rate) => {
      map.set(rate.code, rate.rate);
    });
    return map;
  }, [rates]);

  const usdRateLookup = useMemo(() => {
    const map = new Map<string, number>();
    rates.forEach((rate) => {
      map.set(rate.code, rate.usdRate);
    });
    return map;
  }, [rates]);

  const getRateForCurrency = useCallback(
    (currencyCode: string): number => {
      return rateLookup.get(currencyCode) ?? 1;
    },
    [rateLookup]
  );

  const getUsdRateForCurrency = useCallback(
    (currencyCode: string): number => {
      return usdRateLookup.get(currencyCode) ?? 1;
    },
    [usdRateLookup]
  );

  useEffect(() => {
    if (needsRefresh(lastFetchedAt)) {
      fetchRates();
    }
  }, [fetchRates, lastFetchedAt]);

  return {
    rates,
    loading,
    error,
    refreshRates,
    getRateForCurrency,
    getUsdRateForCurrency,
    lastUpdated
  };
}

export default useExchangeRates;
