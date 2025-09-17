import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="text-center lg:text-left animate-fade-in">
          <div className="mb-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
              FinLit<span className="text-singapore-gold">SG</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 font-medium">
              Empowering Migrant Workers in Singapore with Financial Knowledge
            </p>
          </div>
          
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
            Learn to save, budget, invest, and send money home safely. Built specifically for workers in Singapore.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button variant="hero" size="xl" className="text-lg font-semibold">
              Sign Up Free
            </Button>
            <Button variant="outline-hero" size="xl" className="text-lg">
              Login
            </Button>
            <Button variant="ghost" size="xl" className="text-primary-foreground hover:bg-white/10">
              Explore as Guest
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
            💰 Save Money
          </div>
          <div className="absolute -bottom-4 -left-4 bg-growth-green text-white px-4 py-2 rounded-full text-sm font-semibold animate-float animation-delay-1000">
            📱 Easy to Use
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