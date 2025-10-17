// Google Cloud Translate Service
// Uses Google Cloud Translate API for fast and accurate translations

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

class GoogleTranslateService {
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'english': 'en',
      'bengali': 'bn',
      'chinese': 'zh',
      'tamil': 'ta',
      'hindi': 'hi',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'japanese': 'ja',
      'korean': 'ko',
      'arabic': 'ar',
      'portuguese': 'pt',
      'russian': 'ru',
      'italian': 'it',
      'dutch': 'nl',
      'swedish': 'sv',
      'norwegian': 'no',
      'danish': 'da',
      'finnish': 'fi',
      'polish': 'pl',
      'czech': 'cs',
      'hungarian': 'hu',
      'greek': 'el',
      'turkish': 'tr',
      'hebrew': 'he',
      'thai': 'th',
      'vietnamese': 'vi',
      'indonesian': 'id',
      'malay': 'ms',
      'filipino': 'tl',
      'urdu': 'ur',
      'persian': 'fa',
      'swahili': 'sw',
      'amharic': 'am',
      'hausa': 'ha',
      'yoruba': 'yo',
      'igbo': 'ig',
      'zulu': 'zu',
      'afrikaans': 'af',
      'albanian': 'sq',
      'azerbaijani': 'az',
      'belarusian': 'be',
      'bulgarian': 'bg',
      'catalan': 'ca',
      'croatian': 'hr',
      'estonian': 'et',
      'georgian': 'ka',
      'icelandic': 'is',
      'latvian': 'lv',
      'lithuanian': 'lt',
      'macedonian': 'mk',
      'maltese': 'mt',
      'moldovan': 'mo',
      'montenegrin': 'me',
      'romanian': 'ro',
      'serbian': 'sr',
      'slovak': 'sk',
      'slovenian': 'sl',
      'ukrainian': 'uk',
      'welsh': 'cy',
      'basque': 'eu',
      'galician': 'gl',
      'irish': 'ga',
      'scottish': 'gd',
      'breton': 'br',
      'cornish': 'kw',
      'manx': 'gv'
    };

    return languageMap[language.toLowerCase()] || language.toLowerCase();
  }

  private getLanguageName(code: string): string {
    const nameMap: { [key: string]: string } = {
      'en': 'English',
      'bn': 'Bengali',
      'zh': 'Chinese',
      'ta': 'Tamil',
      'hi': 'Hindi',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'it': 'Italian',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'el': 'Greek',
      'tr': 'Turkish',
      'he': 'Hebrew',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'ur': 'Urdu',
      'fa': 'Persian',
      'sw': 'Swahili',
      'am': 'Amharic',
      'ha': 'Hausa',
      'yo': 'Yoruba',
      'ig': 'Igbo',
      'zu': 'Zulu',
      'af': 'Afrikaans',
      'sq': 'Albanian',
      'az': 'Azerbaijani',
      'be': 'Belarusian',
      'bg': 'Bulgarian',
      'ca': 'Catalan',
      'hr': 'Croatian',
      'et': 'Estonian',
      'ka': 'Georgian',
      'is': 'Icelandic',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mk': 'Macedonian',
      'mt': 'Maltese',
      'mo': 'Moldovan',
      'me': 'Montenegrin',
      'ro': 'Romanian',
      'sr': 'Serbian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'uk': 'Ukrainian',
      'cy': 'Welsh',
      'eu': 'Basque',
      'gl': 'Galician',
      'ga': 'Irish',
      'gd': 'Scottish',
      'br': 'Breton',
      'kw': 'Cornish',
      'gv': 'Manx'
    };

    return nameMap[code] || code.toUpperCase();
  }

  async translate({ text, targetLanguage, sourceLanguage = 'auto' }: TranslationRequest): Promise<TranslationResponse> {
    try {
      const targetLangCode = this.getLanguageCode(targetLanguage);
      const sourceLangCode = sourceLanguage === 'auto' ? 'auto' : this.getLanguageCode(sourceLanguage);

      const requestBody = {
        q: text,
        target: targetLangCode,
        source: sourceLangCode === 'auto' ? undefined : sourceLangCode,
        format: 'text'
      };

      // Remove undefined values
      const cleanRequestBody = Object.fromEntries(
        Object.entries(requestBody).filter(([_, value]) => value !== undefined)
      );

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanRequestBody)
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.data.translations || !data.data.translations[0]) {
        throw new Error('Invalid response from Google Translate API');
      }

      const translation = data.data.translations[0];
      const translatedText = translation.translatedText;

      return {
        translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLangCode,
        targetLanguage: targetLangCode
      };

    } catch (error) {
      console.error('Google Translate error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Batch translation for multiple texts
  async translateBatch(texts: string[], targetLanguage: string, sourceLanguage = 'auto'): Promise<TranslationResponse[]> {
    const promises = texts.map(text => this.translate({ text, targetLanguage, sourceLanguage }));
    return Promise.all(promises);
  }

  // Get supported languages
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'bn', name: 'Bengali' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ta', name: 'Tamil' },
      { code: 'hi', name: 'Hindi' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'it', name: 'Italian' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'da', name: 'Danish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'cs', name: 'Czech' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'el', name: 'Greek' },
      { code: 'tr', name: 'Turkish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'th', name: 'Thai' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
      { code: 'tl', name: 'Filipino' },
      { code: 'ur', name: 'Urdu' },
      { code: 'fa', name: 'Persian' },
      { code: 'sw', name: 'Swahili' }
    ];
  }
}

// Create singleton instance
const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBxW0vyudpu-SYutult6LI522pFp5HNcjs';
export const googleTranslateService = new GoogleTranslateService(GOOGLE_TRANSLATE_API_KEY);

export default googleTranslateService;
