import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calculator, Send, TrendingUp, Target, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_CONFIG } from "@/config/app";

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className="p-4 space-y-6">
      
      {/* Enhanced Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          {t('home.welcome')}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('app.description')}
        </p>
        <div className="bg-gradient-hero rounded-xl p-6 text-white shadow-glow">
          <h2 className="text-xl font-semibold mb-2">{t('home.startJourney')}</h2>
          <p className="mb-4 opacity-90">{t('app.tagline')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="secondary" size="lg" className="shadow-soft">
              <Link to="/dashboard/modules">{t('nav.modules')}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t('home.quickActions')}</h2>
        <div className="grid grid-cols-1 gap-3">
          <Card className="shadow-card hover-theme">
            <CardContent className="p-4">
              <Link to="/dashboard/modules" className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {t('home.modules.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('home.modules.desc')}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card hover-theme">
            <CardContent className="p-4">
              <Link to="/dashboard/calculators" className="flex items-center gap-4 group">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Calculator className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-secondary transition-colors">
                    {t('home.calculators.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('home.calculators.desc')}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card hover-theme">
            <CardContent className="p-4">
              <Link to="/dashboard/remittances" className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {t('home.remittances.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('home.remittances.desc')}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Tip of the Day */}
      <Card className="bg-accent border-accent-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <TrendingUp className="h-5 w-5" />
            {t('home.tip.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-accent-foreground">
            {t('home.tip.text')}
          </p>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t('home.progress.title')}
          </CardTitle>
          <CardDescription>{t('home.progress.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{t('home.progress.modules')}</span>
            <span className="text-sm text-muted-foreground">2 of 8</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "25%" }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{t('home.progress.quizzes')}</span>
            <span className="text-sm text-muted-foreground">3 of 8</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: "37.5%" }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}