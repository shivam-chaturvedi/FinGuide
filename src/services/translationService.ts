// Google Translate API service
interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_KEY = 'finguide-translations';
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  private readonly API_URL = 'https://translation.googleapis.com/language/translate/v2';

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  private async translateText(text: string, targetLang: string): Promise<string> {
    // Check cache first
    if (this.cache[text] && this.cache[text][targetLang]) {
      return this.cache[text][targetLang];
    }

    // If no API key, return original text
    if (!this.API_KEY) {
      console.warn('Google Translate API key not found. Using original text.');
      return text;
    }

    try {
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the translation
      if (!this.cache[text]) {
        this.cache[text] = {};
      }
      this.cache[text][targetLang] = translatedText;
      this.saveCache();

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on error
    }
  }

  async translate(key: string, targetLang: string, fallbackText?: string): Promise<string> {
    // If it's a translation key, try to get the English version first
    const englishText = fallbackText || key;
    
    // If already in target language, return as is
    if (targetLang === 'en') {
      return englishText;
    }

    return await this.translateText(englishText, targetLang);
  }

  // Batch translate multiple texts
  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    if (targetLang === 'en') {
      return texts;
    }

    const promises = texts.map(text => this.translateText(text, targetLang));
    return Promise.all(promises);
  }

  // Clear cache
  clearCache() {
    this.cache = {};
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Get cache size
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }
}

export const translationService = new TranslationService();
