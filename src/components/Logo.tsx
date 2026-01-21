interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

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

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/assets/logo.jpeg"
          alt="MigFin logo"
          className={`${sizeClasses[size]} rounded-md object-cover border border-border shadow-xl`}
          loading="lazy"
        />
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${textSizes[size]}`}>
          MigFin
        </span>
      )}
    </div>
  );
}

