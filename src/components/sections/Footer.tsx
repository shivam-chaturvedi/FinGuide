import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { useTheme } from "@/contexts/ThemeContext";

const Footer = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold">
                {APP_CONFIG.name}
              </h3>
              <p className="text-background/80 mt-2 max-w-md">
                {APP_CONFIG.description} and tools for a better future.
              </p>
            </div>
            <div className="text-sm text-background/60">
              © 2025 {APP_CONFIG.name} • Made for {APP_CONFIG.targetAudience}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#about" className="hover:text-singapore-gold transition-colors">About</a></li>
              <li><a href="#features" className="hover:text-singapore-gold transition-colors">Features</a></li>
              <li><a href="#help" className="hover:text-singapore-gold transition-colors">Help/FAQ</a></li>
              <li><a href="#contact" className="hover:text-singapore-gold transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Language Toggle and Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Language</h4>
            <Button variant="outline" size="sm" className="mb-4 text-foreground border-background/20 hover:bg-background/10">
              <Globe className="h-4 w-4 mr-2" />
              English ↔ 中文
            </Button>
            
            <div className="text-sm text-background/60">
              <p>🇸🇬 Made in Singapore</p>
              <p>🌏 For workers worldwide</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60 text-sm">
            Financial literacy is the foundation of financial freedom. Start your journey today.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;