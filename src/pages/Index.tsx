import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme as useNextTheme } from "next-themes";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import PurposeSection from "@/components/sections/PurposeSection";
import ScopeSection from "@/components/sections/ScopeSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import ImpactSection from "@/components/sections/ImpactSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";
import GoogleTranslate from "@/components/GoogleTranslate";

const Index = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { theme: darkMode } = useNextTheme();
  const { user, loading } = useAuth();
  const isDark = darkMode === 'dark';

  useEffect(() => {
    // Only redirect if we're not loading and user exists
    if (!loading && user) {
      window.location.href = '/dashboard';
      return;
    }
  }, [user, loading]);

  useEffect(() => {
    // Only set up animations if user is not logged in
    if (!user) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [user]);


  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col ${isDark ? 'dark' : ''} theme-${theme}`}>
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Logo size="md" showText={true} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <GoogleTranslate />
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/dashboard/profile">Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">{t('nav.signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <PurposeSection />
        <ScopeSection />
        <FeaturesSection />
        <ImpactSection />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;