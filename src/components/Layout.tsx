import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "./BottomNavigation";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { APP_CONFIG } from "@/config/app";
import { LogOut, User } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {t('app.name')}
        </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{profile?.full_name || user.email}</span>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/dashboard/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={signOut}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Button asChild variant="ghost" size="sm">
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
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation - Only show for dashboard pages */}
      {isDashboardPage && <BottomNavigation />}
    </div>
  );
}