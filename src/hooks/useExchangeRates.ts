import { useState, useEffect, useCallback } from 'react';
import { hardcodedExchangeRates, getExchangeRate, getAllExchangeRates, type ExchangeRate } from '@/data/exchangeRates';

interface UseExchangeRatesReturn {
  rates: ExchangeRate[];
  loading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  getRateForCurrency: (currencyCode: string) => number;
  lastUpdated: string | null;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false); // No loading needed for hardcoded data
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use hardcoded rates immediately
      const fetchedRates = getAllExchangeRates();
      setRates(fetchedRates);
      
      if (fetchedRates.length > 0) {
        setLastUpdated(fetchedRates[0].lastUpdated);
      }
    } catch (err) {
      console.error('Failed to load exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRates = useCallback(async () => {
    // For hardcoded rates, just reload the same data
    // In a real app, you might want to update the rates periodically
    try {
      setLoading(true);
      setError(null);
      
      const refreshedRates = getAllExchangeRates();
      setRates(refreshedRates);
      
      if (refreshedRates.length > 0) {
        setLastUpdated(refreshedRates[0].lastUpdated);
      }
    } catch (err) {
      console.error('Failed to refresh exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  const getRateForCurrency = useCallback((currencyCode: string): number => {
    return getExchangeRate(currencyCode);
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    refreshRates,
    getRateForCurrency,
    lastUpdated
  };
}

export default useExchangeRates;