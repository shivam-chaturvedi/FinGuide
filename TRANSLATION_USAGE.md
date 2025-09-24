# Translation System Usage Guide

This application now uses Google Translate API for dynamic translation instead of hardcoded translations.

## Setup

1. **Get Google Translate API Key** (see `GOOGLE_TRANSLATE_SETUP.md`)
2. **Set Environment Variable**:
   ```env
   VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```

## Usage in Components

### Method 1: Using TranslatedText Component (Recommended)

```tsx
import { TranslatedText } from '@/components/TranslatedText';

function MyComponent() {
  return (
    <div>
      <h1>
        <TranslatedText translationKey="app.name" />
      </h1>
      <p>
        <TranslatedText 
          translationKey="hero.description" 
          fallbackText="Default text if translation fails"
        />
      </p>
    </div>
  );
}
```

### Method 2: Using useTranslatedText Hook

```tsx
import { useTranslatedText } from '@/components/TranslatedText';

function MyComponent() {
  const { translatedText, isLoading } = useTranslatedText('app.name');
  
  return (
    <div>
      {isLoading ? 'Loading...' : translatedText}
    </div>
  );
}
```

### Method 3: Using useTranslation Hook

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { translateSync, isKeyLoading } = useTranslation();
  
  return (
    <div>
      {isKeyLoading('app.name') ? 'Loading...' : translateSync('app.name')}
    </div>
  );
}
```

## Key Features

### 1. **Automatic Caching**
- Translations are cached in localStorage
- No repeated API calls for the same text
- Works offline with cached translations

### 2. **Fallback System**
- Falls back to English if translation fails
- Shows fallback text if provided
- Graceful error handling

### 3. **Loading States**
- Shows loading indicators during translation
- Prevents layout shifts
- Smooth user experience

### 4. **Performance Optimized**
- Only translates when language changes
- Caches translations locally
- Minimal API calls

## Available Translation Keys

All translation keys are defined in `src/contexts/LanguageContext.tsx` under `englishTexts`:

```typescript
// App branding
'app.name' // FinGuide SG
'app.description' // Empowering Migrant Workers...
'app.tagline' // Learn, Save, and Send Money Safely

// Navigation
'nav.dashboard' // Dashboard
'nav.modules' // Modules
'nav.calculators' // Tools
'nav.remittances' // Remit
'nav.profile' // Profile

// And many more...
```

## Adding New Translation Keys

1. **Add to English texts** in `src/contexts/LanguageContext.tsx`:
   ```typescript
   const englishTexts = {
     // ... existing keys
     'my.new.key': 'My new text to translate',
   };
   ```

2. **Use in components**:
   ```tsx
   <TranslatedText translationKey="my.new.key" />
   ```

## Supported Languages

- `en` - English (source language)
- `zh` - Chinese (Simplified)

To add more languages, update the `Language` type in `src/contexts/LanguageContext.tsx`.

## Error Handling

The system handles errors gracefully:
- Shows original English text if translation fails
- Logs errors to console for debugging
- Continues to function normally
- No user-facing error messages

## Performance Tips

1. **Use TranslatedText component** for most cases
2. **Provide fallback text** for better UX
3. **Avoid translating in loops** - use batch translation
4. **Cache frequently used translations** in component state

## Migration from Old System

The old hardcoded translation system has been removed. To migrate:

1. Replace `t('key')` with `<TranslatedText translationKey="key" />`
2. Replace `{t('key')}` with `{translateSync('key')}` in JSX
3. Use `useTranslatedText` hook for async translations
4. Add fallback text where appropriate

## Example Migration

**Before:**
```tsx
const { t } = useLanguage();
return <h1>{t('app.name')}</h1>;
```

**After:**
```tsx
return <h1><TranslatedText translationKey="app.name" /></h1>;
```

