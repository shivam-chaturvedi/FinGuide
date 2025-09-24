import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedTextProps {
  translationKey: string;
  fallbackText?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  showLoading?: boolean;
  loadingText?: string;
}

export function TranslatedText({ 
  translationKey, 
  fallbackText, 
  className, 
  as: Component = 'span',
  children,
  showLoading = true,
  loadingText = '...'
}: TranslatedTextProps) {
  const { t, language, isTranslating } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const translateText = async () => {
      setIsLoading(true);
      try {
        const text = await t(translationKey, fallbackText);
        setTranslatedText(text);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallbackText || translationKey);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [translationKey, language, t, fallbackText]);

  const displayText = isLoading && showLoading ? loadingText : translatedText;

  return (
    <Component className={className}>
      {children || displayText}
    </Component>
  );
}

// Hook for getting translated text
export function useTranslatedText(translationKey: string, fallbackText?: string) {
  const { t, language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(fallbackText || translationKey);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const translateText = async () => {
      setIsLoading(true);
      try {
        const text = await t(translationKey, fallbackText);
        setTranslatedText(text);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallbackText || translationKey);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [translationKey, language, t, fallbackText]);

  return { translatedText, isLoading };
}

