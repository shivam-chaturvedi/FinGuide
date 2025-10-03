import { useTheme } from "@/contexts/ThemeContext";
import { Palette, TrendingUp, Shield, Zap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl", 
    xl: "text-4xl"
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'ocean':
        return <Shield className={sizeClasses[size]} />;
      case 'forest':
        return <TrendingUp className={sizeClasses[size]} />;
      case 'sunset':
        return <Zap className={sizeClasses[size]} />;
      case 'midnight':
        return <Shield className={sizeClasses[size]} />;
      case 'purple':
        return <Palette className={sizeClasses[size]} />;
      case 'default':
        return <Shield className={sizeClasses[size]} />;
      default:
        return <Palette className={sizeClasses[size]} />;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-sm opacity-30"></div>
        <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg text-white">
          {getThemeIcon()}
        </div>
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${textSizes[size]}`}>
          FinGuide
        </span>
      )}
    </div>
  );
}




