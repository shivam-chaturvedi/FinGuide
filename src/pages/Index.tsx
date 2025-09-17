import { useEffect } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import PurposeSection from "@/components/sections/PurposeSection";
import ScopeSection from "@/components/sections/ScopeSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import ImpactSection from "@/components/sections/ImpactSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

const Index = () => {
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <PurposeSection />
      <ScopeSection />
      <FeaturesSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;