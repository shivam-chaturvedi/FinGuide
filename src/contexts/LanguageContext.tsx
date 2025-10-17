import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallbackText?: string) => string;
  isTranslating: boolean;
  setIsTranslating: (translating: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English fallback texts (source language)
const englishTexts = {
  // App branding
  'app.name': 'FinGuide SG',
  'app.description': 'Empowering Migrant Workers in Singapore with Financial Knowledge',
  'app.tagline': 'Learn, Save, and Send Money Safely',
  'app.targetAudience': 'Migrant Workers in Singapore',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.modules': 'Modules',
  'nav.calculators': 'Tools',
  'nav.remittances': 'Remit',
  'nav.profile': 'Profile',
  'nav.login': 'Sign In',
  'nav.signup': 'Join Free',
  'nav.explore': 'Explore as Guest',
  
  // Hero Section
  'hero.title': 'FinGuide SG',
  'hero.subtitle': 'Empowering Migrant Workers in Singapore with Financial Knowledge',
  'hero.description': 'Learn, Save, and Send Money Safely. Built specifically for Migrant Workers in Singapore.',
  'hero.signup': 'Sign Up Free',
  'hero.login': 'Login',
  'hero.explore': 'Explore as Guest',
  'hero.saveMoney': '💰 Save Money',
  'hero.easyUse': '📱 Easy to Use',
  
  // About Section
  'about.title': 'Why this App?',
  'about.subtitle': 'Discover how FinGuide SG transforms financial literacy for Migrant Workers in Singapore',
  'about.feature1.title': 'Financial Literacy Made Simple',
  'about.feature1.desc': 'Learn savings, budgeting, and investing tailored to Singapore.',
  'about.feature2.title': 'Safe Remittances',
  'about.feature2.desc': 'Compare and understand transfer fees from Singapore to India, Philippines, China, and more.',
  'about.feature3.title': 'Multi-Language Support',
  'about.feature3.desc': 'Switch between English and Mandarin instantly.',
  'about.feature4.title': 'For Migrant Workers',
  'about.feature4.desc': 'Tools built for FDWs and low-wage workers to better manage money.',
  
  // Purpose Section
  'purpose.title': 'Our Purpose',
  'purpose.text1': 'The purpose of this app is to spread financial literacy among Migrant Workers in Singapore.',
  'purpose.text2': 'It empowers workers with knowledge to save, budget, invest, and safely send money home. We believe everyone deserves access to financial education, regardless of their background or income level.',
  'purpose.stats.workers': 'Workers Helped',
  'purpose.stats.countries': 'Countries Supported',
  'purpose.stats.saved': 'Money Saved',
  'purpose.card.title': 'Financial Freedom Starts Here',
  'purpose.card.desc': 'Join thousands of migrant workers who have taken control of their finances through education and smart planning.',
  
  // Features Section
  'features.title': 'Features You\'ll Love',
  'features.subtitle': 'Powerful tools and features designed to make financial learning simple and effective',
  'features.feature1.title': 'Secure Registration & Login',
  'features.feature1.desc': 'Sign up with phone/email + OTP for maximum security.',
  'features.feature2.title': 'Modules & Quizzes',
  'features.feature2.desc': 'Fun lessons on finance + short quizzes to test your knowledge.',
  'features.feature3.title': 'Financial Calculators',
  'features.feature3.desc': 'Remittance, Budget Planner, and Savings Calculator tools.',
  'features.feature4.title': 'Language Translation',
  'features.feature4.desc': 'English ↔ Mandarin, easy toggle for your comfort.',
  'features.feature5.title': 'Singapore-Specific Content',
  'features.feature5.desc': 'Tips & guides relevant to life and work in Singapore.',
  'features.highlight.title': '🎯 Built for Migrant Workers in Singapore',
  'features.highlight.desc': 'Every feature is designed with the unique needs of Migrant Workers in Singapore in mind. From local banking knowledge to remittance comparisons, we\'ve got you covered.',
  
  // Impact Section
  'impact.title': 'Why Financial Literacy Matters',
  'impact.subtitle': 'Understanding the real impact of financial education on migrant workers\' lives',
  'impact.text1': 'Many Migrant Workers in Singapore send most of their income home. Without financial awareness, they struggle to save or avoid high remittance fees.',
  'impact.text2': 'This app provides trusted, Singapore-specific tools to make smarter money decisions.',
  'impact.benefit1': 'Reduce remittance costs by up to 80%',
  'impact.benefit2': 'Build emergency savings faster',
  'impact.benefit3': 'Make informed investment decisions',
  'impact.without.title': 'Without Financial Literacy',
  'impact.without.item1': 'High remittance fees (5-10%)',
  'impact.without.item2': 'No emergency savings',
  'impact.without.item3': 'Vulnerable to scams',
  'impact.without.item4': 'Limited financial growth',
  'impact.with.title': 'With Financial Literacy',
  'impact.with.item1': 'Reduced fees (1-2%)',
  'impact.with.item2': '3-6 months emergency fund',
  'impact.with.item3': 'Protected from fraud',
  'impact.with.item4': 'Growing investments',
  'impact.savings.title': 'Average Savings',
  'impact.savings.amount': '$2,400',
  'impact.savings.desc': 'per year with proper financial planning',
  
  // CTA Section
  'cta.title': 'Ready to Take Control?',
  'cta.subtitle': 'Join thousands of Migrant Workers in Singapore who are already building a better financial future in Singapore. Start your journey today - it\'s completely free!',
  'cta.startLearning': '🚀 Start Learning Free',
  'cta.getStarted': '📱 Get Started',
  'cta.trust1.title': 'Secure & Private',
  'cta.trust1.desc': 'Your data is always protected',
  'cta.trust2.title': 'Comprehensive Learning',
  'cta.trust2.desc': 'Modules on savings, budgeting, and more',
  'cta.trust3.title': 'Singapore Focused',
  'cta.trust3.desc': 'Content tailored for local context',
  
  // Footer
  'footer.description': 'and tools for a better future.',
  'footer.copyright': '© 2025 FinGuide SG • Made for Migrant Workers in Singapore',
  'footer.links.title': 'Quick Links',
  'footer.links.about': 'About',
  'footer.links.features': 'Features',
  'footer.links.help': 'Help/FAQ',
  'footer.links.contact': 'Contact',
  'footer.language.title': 'Language',
  'footer.madeIn': '🇸🇬 Made in Singapore',
  'footer.forWorkers': '🌏 For workers worldwide',
  'footer.bottom': 'Financial literacy is the foundation of financial freedom. Start your journey today.',
  
  // Home Page
  'home.welcome': 'Welcome to FinGuide SG',
  'home.startJourney': 'Start Your Financial Journey',
  'home.quickActions': 'Quick Actions',
  'home.modules.title': 'Financial Modules',
  'home.modules.desc': 'Learn budgeting, savings, and investing basics',
  'home.calculators.title': 'Financial Calculators',
  'home.calculators.desc': 'Budget planner and savings calculator',
  'home.remittances.title': 'Safe Remittances',
  'home.remittances.desc': 'Send money home safely and affordably',
  
  // Login Page
  'login.welcome': 'Welcome Back',
  'login.subtitle': 'Continue your financial journey with FinGuide SG',
  'login.title': 'Sign In',
  'login.desc': 'Enter your credentials to access your account',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.remember': 'Remember me',
  'login.forgot': 'Forgot password?',
  'login.signin': 'Sign In',
  'login.signing': 'Signing In...',
  'login.phone': 'Sign In with Phone',
  'login.noAccount': 'Don\'t have an account?',
  'login.signup': 'Sign Up',
  'login.success': 'Welcome back! 👋',
  'login.successDesc': 'You have successfully logged in to FinGuide SG.',
  
  // Signup Page
  'signup.join': 'Join FinGuide SG',
  'signup.subtitle': 'Start your journey towards financial independence with Singapore\'s most trusted financial education platform for migrant workers.',
  'signup.testimonial': 'FinGuide SG helped me save $2,000 in my first year and learn how to send money home safely. The modules are easy to understand in my language!',
  'signup.testimonialAuthor': 'Aisha Rahman',
  'signup.testimonialRole': 'Domestic Worker, Philippines',
  'signup.title': 'Create Account',
  'signup.desc': 'Enter your details below to get started',
  'signup.fullName': 'Full Name',
  'signup.email': 'Email',
  'signup.password': 'Password',
  'signup.confirmPassword': 'Confirm Password',
  'signup.country': 'Country of Origin',
  'signup.countryPlaceholder': 'Select your country',
  'signup.terms': 'I agree to FinGuide SG\'s',
  'signup.termsLink': 'Terms of Service',
  'signup.and': 'and',
  'signup.privacyLink': 'Privacy Policy',
  'signup.signup': 'Sign Up',
  'signup.creating': 'Creating Account...',
  'signup.haveAccount': 'Already have an account?',
  'signup.login': 'Log In',
  'signup.success': 'Welcome to FinGuide SG! 🎉',
  'signup.successDesc': 'Your account has been created successfully.',
  'signup.passwordMismatch': 'Password Mismatch',
  'signup.passwordMismatchDesc': 'The password and confirm password do not match.',
  'signup.termsRequired': 'Terms and Conditions',
  'signup.termsRequiredDesc': 'You must agree to the terms and conditions to sign up.',
  
  // Common
  'common.back': 'Back',
  'common.or': 'OR',
  'common.loading': 'Loading...',
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('finguide-language') as Language;
    if (savedLanguage && savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finguide-language', language);
  }, [language]);

  // Simple translation function - just returns English text
  const t = (key: string, fallbackText?: string): string => {
    return englishTexts[key as keyof typeof englishTexts] || fallbackText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating, setIsTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}