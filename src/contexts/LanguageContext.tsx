import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object
const translations = {
  en: {
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
    'home.tip.title': 'Tip of the Day',
    'home.tip.text': 'Start with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. This simple budgeting method helps you build financial stability.',
    'home.progress.title': 'Your Learning Progress',
    'home.progress.desc': 'Keep up the great work!',
    'home.progress.modules': 'Modules Completed',
    'home.progress.quizzes': 'Quizzes Passed',
    
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
  },
  zh: {
    // App branding
    'app.name': '金融指南新加坡',
    'app.description': '为新加坡外籍工人提供金融知识赋能',
    'app.tagline': '学习、储蓄、安全汇款',
    'app.targetAudience': '新加坡外籍工人',
    
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.modules': '课程',
    'nav.calculators': '工具',
    'nav.remittances': '汇款',
    'nav.profile': '个人',
    'nav.login': '登录',
    'nav.signup': '免费加入',
    'nav.explore': '访客浏览',
    
    // Hero Section
    'hero.title': '金融指南新加坡',
    'hero.subtitle': '为新加坡外籍工人提供金融知识赋能',
    'hero.description': '学习、储蓄、安全汇款。专为新加坡外籍工人打造。',
    'hero.signup': '免费注册',
    'hero.login': '登录',
    'hero.explore': '访客浏览',
    'hero.saveMoney': '💰 省钱',
    'hero.easyUse': '📱 易用',
    
    // About Section
    'about.title': '为什么选择这个应用？',
    'about.subtitle': '了解金融指南新加坡如何改变新加坡外籍工人的金融素养',
    'about.feature1.title': '简化金融素养',
    'about.feature1.desc': '学习适合新加坡的储蓄、预算和投资知识。',
    'about.feature2.title': '安全汇款',
    'about.feature2.desc': '比较和了解从新加坡到印度、菲律宾、中国等地的转账费用。',
    'about.feature3.title': '多语言支持',
    'about.feature3.desc': '在英语和中文之间即时切换。',
    'about.feature4.title': '为外籍工人设计',
    'about.feature4.desc': '为家庭帮佣和低薪工人打造的工具，更好地管理金钱。',
    
    // Purpose Section
    'purpose.title': '我们的宗旨',
    'purpose.text1': '这个应用的目的是在新加坡外籍工人中传播金融素养。',
    'purpose.text2': '它赋予工人知识来储蓄、预算、投资和安全地汇款回家。我们相信每个人都应该获得金融教育，无论其背景或收入水平如何。',
    'purpose.stats.workers': '帮助的工人',
    'purpose.stats.countries': '支持的国家',
    'purpose.stats.saved': '节省的钱',
    'purpose.card.title': '财务自由从这里开始',
    'purpose.card.desc': '加入数千名通过教育和明智规划掌控财务的外籍工人。',
    
    // Features Section
    'features.title': '您会喜欢的功能',
    'features.subtitle': '专为简化金融学习而设计的强大工具和功能',
    'features.feature1.title': '安全注册和登录',
    'features.feature1.desc': '使用手机/邮箱 + 验证码注册，确保最大安全性。',
    'features.feature2.title': '课程和测验',
    'features.feature2.desc': '有趣的金融课程 + 简短测验来测试您的知识。',
    'features.feature3.title': '金融计算器',
    'features.feature3.desc': '汇款、预算规划师和储蓄计算器工具。',
    'features.feature4.title': '语言翻译',
    'features.feature4.desc': '英语 ↔ 中文，轻松切换让您舒适使用。',
    'features.feature5.title': '新加坡特定内容',
    'features.feature5.desc': '与新加坡生活和工作相关的提示和指南。',
    'features.highlight.title': '🎯 为新加坡外籍工人打造',
    'features.highlight.desc': '每个功能都考虑到新加坡外籍工人的独特需求。从本地银行知识到汇款比较，我们为您提供全面支持。',
    
    // Impact Section
    'impact.title': '为什么金融素养很重要',
    'impact.subtitle': '了解金融教育对外籍工人生活的真正影响',
    'impact.text1': '许多新加坡外籍工人将大部分收入寄回家。没有金融意识，他们很难储蓄或避免高额汇款费用。',
    'impact.text2': '这个应用提供值得信赖的新加坡特定工具，帮助做出更明智的金钱决策。',
    'impact.benefit1': '减少汇款费用高达80%',
    'impact.benefit2': '更快建立应急储蓄',
    'impact.benefit3': '做出明智的投资决策',
    'impact.without.title': '没有金融素养',
    'impact.without.item1': '高汇款费用（5-10%）',
    'impact.without.item2': '没有应急储蓄',
    'impact.without.item3': '容易受骗',
    'impact.without.item4': '财务增长有限',
    'impact.with.title': '有金融素养',
    'impact.with.item1': '降低费用（1-2%）',
    'impact.with.item2': '3-6个月应急基金',
    'impact.with.item3': '免受欺诈',
    'impact.with.item4': '投资增长',
    'impact.savings.title': '平均节省',
    'impact.savings.amount': '$2,400',
    'impact.savings.desc': '通过合理财务规划每年节省',
    
    // CTA Section
    'cta.title': '准备好掌控了吗？',
    'cta.subtitle': '加入数千名正在新加坡建设更好财务未来的外籍工人。今天就开始您的旅程 - 完全免费！',
    'cta.startLearning': '🚀 免费开始学习',
    'cta.getStarted': '📱 开始使用',
    'cta.trust1.title': '安全私密',
    'cta.trust1.desc': '您的数据始终受到保护',
    'cta.trust2.title': '全面学习',
    'cta.trust2.desc': '储蓄、预算等模块',
    'cta.trust3.title': '专注新加坡',
    'cta.trust3.desc': '针对本地情况量身定制的内容',
    
    // Footer
    'footer.description': '和工具，创造更美好的未来。',
    'footer.copyright': '© 2025 金融指南新加坡 • 为新加坡外籍工人打造',
    'footer.links.title': '快速链接',
    'footer.links.about': '关于',
    'footer.links.features': '功能',
    'footer.links.help': '帮助/常见问题',
    'footer.links.contact': '联系我们',
    'footer.language.title': '语言',
    'footer.madeIn': '🇸🇬 新加坡制造',
    'footer.forWorkers': '🌏 为全球工人服务',
    'footer.bottom': '金融素养是财务自由的基础。今天就开始您的旅程。',
    
    // Home Page
    'home.welcome': '欢迎来到金融指南新加坡',
    'home.startJourney': '开始您的财务之旅',
    'home.quickActions': '快速操作',
    'home.modules.title': '金融模块',
    'home.modules.desc': '学习预算、储蓄和投资基础知识',
    'home.calculators.title': '金融计算器',
    'home.calculators.desc': '预算规划师和储蓄计算器',
    'home.remittances.title': '安全汇款',
    'home.remittances.desc': '安全实惠地汇款回家',
    'home.tip.title': '今日小贴士',
    'home.tip.text': '从50/30/20规则开始：50%用于需求，30%用于想要，20%用于储蓄。这个简单的预算方法帮助您建立财务稳定性。',
    'home.progress.title': '您的学习进度',
    'home.progress.desc': '继续努力！',
    'home.progress.modules': '已完成模块',
    'home.progress.quizzes': '已通过测验',
    
    // Login Page
    'login.welcome': '欢迎回来',
    'login.subtitle': '继续您在金融指南新加坡的财务之旅',
    'login.title': '登录',
    'login.desc': '输入您的凭据以访问您的账户',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.remember': '记住我',
    'login.forgot': '忘记密码？',
    'login.signin': '登录',
    'login.signing': '正在登录...',
    'login.phone': '使用手机登录',
    'login.noAccount': '没有账户？',
    'login.signup': '注册',
    'login.success': '欢迎回来！👋',
    'login.successDesc': '您已成功登录金融指南新加坡。',
    
    // Signup Page
    'signup.join': '加入金融指南新加坡',
    'signup.subtitle': '开始您在新加坡最受信任的外籍工人金融教育平台上的财务独立之旅。',
    'signup.testimonial': '金融指南新加坡帮助我在第一年节省了$2,000，并学会了如何安全地汇款回家。课程用我的语言很容易理解！',
    'signup.testimonialAuthor': '艾莎·拉赫曼',
    'signup.testimonialRole': '家庭帮佣，菲律宾',
    'signup.title': '创建账户',
    'signup.desc': '在下方输入您的详细信息开始',
    'signup.fullName': '全名',
    'signup.email': '邮箱',
    'signup.password': '密码',
    'signup.confirmPassword': '确认密码',
    'signup.country': '原籍国',
    'signup.countryPlaceholder': '选择您的国家',
    'signup.terms': '我同意金融指南新加坡的',
    'signup.termsLink': '服务条款',
    'signup.and': '和',
    'signup.privacyLink': '隐私政策',
    'signup.signup': '注册',
    'signup.creating': '正在创建账户...',
    'signup.haveAccount': '已有账户？',
    'signup.login': '登录',
    'signup.success': '欢迎来到金融指南新加坡！🎉',
    'signup.successDesc': '您的账户已成功创建。',
    'signup.passwordMismatch': '密码不匹配',
    'signup.passwordMismatchDesc': '密码和确认密码不匹配。',
    'signup.termsRequired': '条款和条件',
    'signup.termsRequiredDesc': '您必须同意条款和条件才能注册。',
    
    // Common
    'common.back': '返回',
    'common.or': '或',
    'common.loading': '加载中...',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('finguide-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finguide-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
