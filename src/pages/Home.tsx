import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calculator, Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_CONFIG } from "@/config/app";
import { useEffect, useRef } from "react";

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

      {/* Financial Education Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <BookOpen className="h-5 w-5" />
            Financial Education for Migrant Workers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700 dark:text-blue-300">
            Our comprehensive financial education platform is designed specifically for migrant workers in Singapore. 
            Learn essential money management skills, understand Singapore's financial system, and build a secure financial future.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Free Education</div>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Access Available</div>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Multi-Language</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Financial Education Matters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Why Financial Education Matters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 dark:text-green-400">✓ Benefits of Financial Literacy</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Make informed financial decisions</li>
                <li>• Avoid financial scams and fraud</li>
                <li>• Build emergency savings</li>
                <li>• Plan for your family's future</li>
                <li>• Send money home more efficiently</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">📚 What You'll Learn</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Basic budgeting and money management</li>
                <li>• Understanding Singapore's banking system</li>
                <li>• Safe and affordable remittance options</li>
                <li>• Investment basics and savings strategies</li>
                <li>• Financial planning for your goals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Calculator className="h-5 w-5" />
            Real Impact Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm italic text-green-700 dark:text-green-300">
                "After learning about budgeting, I saved $200 more each month and can now send more money to my family."
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">- Maria, Domestic Helper</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm italic text-green-700 dark:text-green-300">
                "The remittance guide helped me find better rates. I save $50 every month on transfer fees."
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">- Ahmed, Construction Worker</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}