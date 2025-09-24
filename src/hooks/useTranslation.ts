import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { t, isTranslating } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const translate = async (key: string, fallbackText?: string): Promise<string> => {
    // If already translated, return cached version
    if (translations[key]) {
      return translations[key];
    }

    // If currently loading, return fallback
    if (loadingKeys.has(key)) {
      return fallbackText || key;
    }

    // Mark as loading
    setLoadingKeys(prev => new Set(prev).add(key));

    try {
      const translatedText = await t(key, fallbackText);
      setTranslations(prev => ({ ...prev, [key]: translatedText }));
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return fallbackText || key;
    } finally {
      setLoadingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const translateSync = (key: string, fallbackText?: string): string => {
    return translations[key] || fallbackText || key;
  };

  const isKeyLoading = (key: string): boolean => {
    return loadingKeys.has(key);
  };

  const clearTranslations = () => {
    setTranslations({});
    setLoadingKeys(new Set());
  };

  return {
    translate,
    translateSync,
    isKeyLoading,
    isTranslating,
    clearTranslations,
  };
}

