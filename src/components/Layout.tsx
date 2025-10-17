import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "./BottomNavigation";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import GoogleTranslate from "./GoogleTranslate";

export function Layout() {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Google Translate Widget */}
      <GoogleTranslate />
      
      {/* Enhanced Responsive Header */}
      <header className="bg-card border-b border-border p-3 sm:p-4 flex justify-between items-center shadow-sm">
        {/* Logo */}
        <Logo size="sm" showText={true} className="truncate" />
        
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{profile?.full_name || user.email}</span>
              </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/dashboard/profile">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t('nav.profile')}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('common.signOut', 'Sign Out')}</span>
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

                {/* Mobile Menu */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t('app.name')}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded-lg">
                      <User className="h-4 w-4" />
                      <span>{profile?.full_name || user.email}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button asChild variant="ghost" className="w-full justify-start">
                        <Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          {t('nav.profile')}
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('common.signOut', 'Sign Out')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.login')}
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start">
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.signup')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 sm:pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation - Only show for dashboard pages */}
      {isDashboardPage && <BottomNavigation />}
    </div>
  );
}
