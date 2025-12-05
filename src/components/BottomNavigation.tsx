import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calculator, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "nav.dashboard" },
  { href: "/dashboard/modules", icon: BookOpen, labelKey: "nav.modules" },
  { href: "/dashboard/calculators", icon: Calculator, labelKey: "nav.calculators" },
  { href: "/dashboard/remittances", icon: Send, labelKey: "nav.remittances" },
  { href: "/dashboard/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNavigation() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-1 sm:px-2 py-1 sm:py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = location.pathname === href || 
            (href === "/dashboard" && location.pathname === "/dashboard/");
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
              <span className="text-xs font-medium truncate leading-tight">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
