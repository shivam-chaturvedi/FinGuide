import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Shield, 
  Clock, 
  Star, 
  ExternalLink, 
  AlertTriangle, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  Info,
  ArrowRight,
  Zap,
  Users,
  Award,
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// Enhanced remittance providers with real data
const remittanceProviders = [
  {
    id: "wise",
    name: "Wise (TransferWise)",
    logo: "💳",
    rating: 4.8,
    reviews: 125000,
    fee: "0.5%",
    minFee: 0.65,
    maxFee: 2.50,
    time: "1-2 days",
    countries: ["India", "Philippines", "China", "Bangladesh", "Myanmar", "Thailand", "Vietnam"],
    features: ["Real exchange rate", "Low fees", "Mobile app", "Multi-currency account"],
    trusted: true,
    masRegulated: true,
    website: "https://wise.com",
    color: "bg-blue-500",
    exchangeRate: 1.0,
    securityScore: 95
  },
  {
    id: "remitly",
    name: "Remitly",
    logo: "🚀",
    rating: 4.6,
    reviews: 89000,
    fee: "1.2%",
    minFee: 1.99,
    maxFee: 4.99,
    time: "Minutes",
    countries: ["India", "Philippines", "Bangladesh", "Mexico", "Guatemala"],
    features: ["Fast transfers", "Cash pickup", "Bank deposit", "Mobile app"],
    trusted: true,
    masRegulated: true,
    website: "https://remitly.com",
    color: "bg-green-500",
    exchangeRate: 0.98,
    securityScore: 92
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    logo: "🌍",
    rating: 4.4,
    reviews: 67000,
    fee: "$3.99",
    minFee: 3.99,
    maxFee: 8.99,
    time: "15 mins",
    countries: ["India", "Philippines", "China", "Nigeria", "Kenya"],
    features: ["Multiple payout options", "24/7 support", "Mobile app", "Cash pickup"],
    trusted: true,
    masRegulated: true,
    website: "https://worldremit.com",
    color: "bg-purple-500",
    exchangeRate: 0.97,
    securityScore: 88
  },
  {
    id: "instarem",
    name: "InstaReM",
    logo: "⚡",
    rating: 4.3,
    reviews: 45000,
    fee: "0.5%",
    minFee: 1.00,
    maxFee: 3.00,
    time: "Same day",
    countries: ["India", "Philippines", "Bangladesh", "Sri Lanka"],
    features: ["Zero markup", "Fast transfers", "Transparent fees", "Mobile app"],
    trusted: true,
    masRegulated: true,
    website: "https://instarem.com",
    color: "bg-orange-500",
    exchangeRate: 0.99,
    securityScore: 90
  }
];

const countryData = [
  { 
    code: "IN", 
    name: "India", 
    flag: "🇮🇳", 
    currency: "INR", 
    tips: "Use UPI for instant transfers",
    popularMethods: ["Bank Transfer", "UPI", "Cash Pickup"],
    exchangeRate: 83.50,
    regulations: "RBI regulated, 2FA required"
  },
  { 
    code: "PH", 
    name: "Philippines", 
    flag: "🇵🇭", 
    currency: "PHP", 
    tips: "GCash and bank transfers available",
    popularMethods: ["GCash", "Bank Transfer", "Cash Pickup"],
    exchangeRate: 56.20,
    regulations: "BSP regulated, ID verification required"
  },
  { 
    code: "CN", 
    name: "China", 
    flag: "🇨🇳", 
    currency: "CNY", 
    tips: "Alipay integration for convenience",
    popularMethods: ["Alipay", "WeChat Pay", "Bank Transfer"],
    exchangeRate: 7.25,
    regulations: "SAFE regulated, strict documentation"
  },
  { 
    code: "BD", 
    name: "Bangladesh", 
    flag: "🇧🇩", 
    currency: "BDT", 
    tips: "Mobile banking widely accepted",
    popularMethods: ["bKash", "Rocket", "Bank Transfer"],
    exchangeRate: 110.50,
    regulations: "Bangladesh Bank regulated"
  },
  { 
    code: "MM", 
    name: "Myanmar", 
    flag: "🇲🇲", 
    currency: "MMK", 
    tips: "Mobile money services available",
    popularMethods: ["Wave Money", "KBZ Pay", "Cash Pickup"],
    exchangeRate: 2100.00,
    regulations: "CBM regulated, limited digital options"
  },
  { 
    code: "TH", 
    name: "Thailand", 
    flag: "🇹🇭", 
    currency: "THB", 
    tips: "PromptPay integration available",
    popularMethods: ["PromptPay", "Bank Transfer", "Cash Pickup"],
    exchangeRate: 36.80,
    regulations: "BOT regulated, mobile banking popular"
  }
];

const safetyTips = [
  {
    icon: Shield,
    title: "Use Licensed Providers",
    description: "Only use MAS-regulated money transfer services",
    priority: "high"
  },
  {
    icon: AlertTriangle,
    title: "Compare Rates",
    description: "Check exchange rates and fees before sending",
    priority: "high"
  },
  {
    icon: Clock,
    title: "Keep Records",
    description: "Save all transaction receipts and reference numbers",
    priority: "medium"
  },
  {
    icon: CheckCircle,
    title: "Verify Recipient",
    description: "Double-check recipient details before sending",
    priority: "high"
  },
  {
    icon: Info,
    title: "Understand Fees",
    description: "Know all fees including hidden charges",
    priority: "medium"
  }
];

export default function Remittances() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [amount, setAmount] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  const currentCountry = countryData.find(c => c.code === selectedCountry);
  const currentAmount = parseFloat(amount) || 0;

  const calculateCost = (provider: typeof remittanceProviders[0]) => {
    if (!currentAmount) return { total: 0, fee: 0, received: 0 };
    
    const fee = provider.fee.includes('%') 
      ? (currentAmount * parseFloat(provider.fee) / 100)
      : parseFloat(provider.fee.replace('$', ''));
    
    const actualFee = Math.max(provider.minFee, Math.min(fee, provider.maxFee));
    const total = currentAmount + actualFee;
    const received = (currentAmount * provider.exchangeRate * currentCountry?.exchangeRate || 1);
    
    return { total, fee: actualFee, received };
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = remittanceProviders.find(p => p.id === providerId);
    if (provider) {
      window.open(provider.website, '_blank');
    }
  };

  const handleCountryGuide = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setShowCalculator(true);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          {t('remittances.title', 'Safe Remittances')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('remittances.subtitle', 'Send money home securely and affordably')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => setShowCalculator(!showCalculator)}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <Calculator className="h-6 w-6" />
          <span className="text-sm font-medium">{t('remittances.calculator', 'Cost Calculator')}</span>
        </Button>
        <Button 
          onClick={() => setComparisonMode(!comparisonMode)}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <TrendingUp className="h-6 w-6" />
          <span className="text-sm font-medium">{t('remittances.compare', 'Compare Providers')}</span>
        </Button>
        <Button 
          onClick={() => window.open('/dashboard/calculators', '_blank')}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <BookOpen className="h-6 w-6" />
          <span className="text-sm font-medium">{t('remittances.guides', 'Learn More')}</span>
        </Button>
      </div>

      {/* Cost Calculator */}
      {showCalculator && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('remittances.calculator', 'Remittance Cost Calculator')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('remittances.sendAmount', 'Amount to Send (SGD)')}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('remittances.destination', 'Destination Country')}</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryData.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          {country.flag} {country.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {currentAmount > 0 && currentCountry && (
              <div className="space-y-3">
                <h4 className="font-semibold">{t('remittances.costBreakdown', 'Cost Breakdown')}</h4>
                <div className="grid gap-2">
                  {remittanceProviders.map((provider) => {
                    const cost = calculateCost(provider);
                    return (
                      <div key={provider.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{provider.logo}</span>
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('remittances.receives', 'Recipient receives')}: {cost.received.toFixed(2)} {currentCountry.currency}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">${cost.fee.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{t('remittances.fee', 'fee')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Safety Tips */}
      <Card className="bg-gradient-hero text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            {t('remittances.safetyFirst', 'Safety First')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <tip.icon className="h-5 w-5 mt-0.5 opacity-90" />
                <div>
                  <h4 className="font-medium">{tip.title}</h4>
                  <p className="text-sm opacity-75">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Provider Comparison or List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {comparisonMode ? t('remittances.compareProviders', 'Compare Providers') : t('remittances.recommendedProviders', 'Recommended Providers')}
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            {comparisonMode ? t('remittances.listView', 'List View') : t('remittances.compareView', 'Compare')}
          </Button>
        </div>
        
        {comparisonMode ? (
          <div className="grid gap-4">
            {remittanceProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{provider.logo}</span>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.trusted && (
                      <Badge variant="secondary" className="bg-growth-green/10 text-growth-green border-growth-green/20">
                        <Shield className="h-3 w-3 mr-1" />
                              {t('remittances.trusted', 'Trusted')}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                            <span className="text-xs text-muted-foreground">({provider.reviews.toLocaleString()})</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                            {t('remittances.masRegulated', 'MAS Regulated')}
                    </Badge>
                  </div>
                </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleProviderSelect(provider.id)}
                    >
                      {t('remittances.visitSite', 'Visit Site')}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-primary">{provider.fee}</div>
                      <div className="text-sm text-muted-foreground">{t('remittances.transferFee', 'Transfer Fee')}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-secondary">{provider.time}</div>
                      <div className="text-sm text-muted-foreground">{t('remittances.deliveryTime', 'Delivery Time')}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-accent">{(provider.exchangeRate * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">{t('remittances.exchangeRate', 'Exchange Rate')}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-green-600">{provider.securityScore}%</div>
                      <div className="text-sm text-muted-foreground">{t('remittances.securityScore', 'Security Score')}</div>
                </div>
              </div>
              
              <div>
                    <h5 className="font-medium mb-2">{t('remittances.supportedCountries', 'Supported Countries')}</h5>
                <div className="flex flex-wrap gap-2">
                  {provider.countries.map((country) => (
                    <Badge key={country} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                    <h5 className="font-medium mb-2">{t('remittances.keyFeatures', 'Key Features')}</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {provider.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {remittanceProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleProviderSelect(provider.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                    {provider.trusted && (
                      <Badge variant="secondary" className="bg-growth-green/10 text-growth-green border-growth-green/20">
                        <Shield className="h-3 w-3 mr-1" />
                        {t('remittances.trusted', 'Trusted')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-bold text-primary">{provider.fee}</div>
                      <div className="text-xs text-muted-foreground">{t('remittances.fee', 'Fee')}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-bold text-secondary">{provider.time}</div>
                      <div className="text-xs text-muted-foreground">{t('remittances.time', 'Time')}</div>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    {t('remittances.chooseProvider', 'Choose Provider')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Country Specific Guides */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t('remittances.countryGuides', 'Country Guides')}</h2>
        
        <div className="grid gap-3">
          {countryData.map((guide) => (
            <Card 
              key={guide.code} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCountryGuide(guide.code)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{guide.flag}</span>
                    <div>
                      <h4 className="font-semibold">{guide.name}</h4>
                      <p className="text-sm text-muted-foreground">{guide.tips}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{guide.currency}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('remittances.exchangeRate', 'Rate')}: 1 SGD = {guide.exchangeRate} {guide.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{t('remittances.popularMethods', 'Popular Methods')}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {guide.popularMethods.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}