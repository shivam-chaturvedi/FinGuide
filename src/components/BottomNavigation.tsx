import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calculator, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home", labelCN: "主页" },
  { href: "/modules", icon: BookOpen, label: "Modules", labelCN: "课程" },
  { href: "/calculators", icon: Calculator, label: "Tools", labelCN: "工具" },
  { href: "/remittances", icon: Send, label: "Remit", labelCN: "汇款" },
  { href: "/profile", icon: User, label: "Profile", labelCN: "个人" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ href, icon: Icon, label, labelCN }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-0",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}