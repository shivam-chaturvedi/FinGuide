import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";
import { APP_CONFIG } from "@/config/app";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const HeroSection = () => {
  const { t } = useLanguage();
  const { theme, isDark } = useTheme();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5 bg-pattern"></div>
      </div>
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="mb-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
                  {t('hero.title')}
                </h1>
                <p className="text-xl text-primary-foreground/90 font-medium">
                  {t('hero.subtitle')}
                </p>
              </div>

              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                {t('hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild variant="hero" size="xl" className="text-lg font-semibold">
                  <Link to="/signup">{t('hero.signup')}</Link>
                </Button>
                <Button asChild variant="outline-hero" size="xl" className="text-lg bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700">
                  <Link to="/login">{t('hero.login')}</Link>
                </Button>
              </div>
            </div>
        
        {/* Right Content - Hero Image */}
        <div className="relative animate-scale-in animation-delay-200">
          <div className="relative overflow-hidden rounded-2xl shadow-hero">
            <img 
              src={heroImage} 
              alt="Migrant worker in Singapore using financial app"
              className="w-full h-auto animate-float"
            />
          </div>
          
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-singapore-gold text-white px-4 py-2 rounded-full text-sm font-semibold animate-float animation-delay-500">
                {t('hero.saveMoney')}
              </div>
              <div className="absolute -bottom-4 -left-4 bg-growth-green text-white px-4 py-2 rounded-full text-sm font-semibold animate-float animation-delay-1000">
                {t('hero.easyUse')}
              </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;