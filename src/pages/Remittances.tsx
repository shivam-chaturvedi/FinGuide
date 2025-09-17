import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Shield, Clock, Star, ExternalLink, AlertTriangle } from "lucide-react";

const remittanceProviders = [
  {
    name: "Wise (TransferWise)",
    rating: 4.8,
    fee: "0.5%",
    time: "1-2 days",
    countries: ["India", "Philippines", "China", "Bangladesh"],
    features: ["Real exchange rate", "Low fees", "Mobile app"],
    trusted: true,
    color: "bg-primary"
  },
  {
    name: "Remitly",
    rating: 4.6,
    fee: "1.2%",
    time: "Minutes",
    countries: ["India", "Philippines", "Bangladesh"],
    features: ["Fast transfers", "Cash pickup", "Bank deposit"],
    trusted: true,
    color: "bg-secondary"
  },
  {
    name: "WorldRemit",
    rating: 4.4,
    fee: "$3.99",
    time: "15 mins",
    countries: ["India", "Philippines", "China"],
    features: ["Multiple payout options", "24/7 support"],
    trusted: true,
    color: "bg-accent"
  }
];

const safetyTips = [
  {
    icon: Shield,
    title: "Use Licensed Providers",
    description: "Only use MAS-regulated money transfer services"
  },
  {
    icon: AlertTriangle,
    title: "Compare Rates",
    description: "Check exchange rates and fees before sending"
  },
  {
    icon: Clock,
    title: "Keep Records",
    description: "Save all transaction receipts and reference numbers"
  }
];

export default function Remittances() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Safe Remittances</h1>
        <p className="text-muted-foreground">Send money home securely and affordably</p>
      </div>

      {/* Safety Tips */}
      <Card className="bg-gradient-hero text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Safety First
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

      {/* Recommended Providers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recommended Providers</h2>
        
        {remittanceProviders.map((provider, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.trusted && (
                      <Badge variant="secondary" className="bg-growth-green/10 text-growth-green border-growth-green/20">
                        <Shield className="h-3 w-3 mr-1" />
                        Trusted
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      MAS Regulated
                    </Badge>
                  </div>
                </div>
                <Button size="sm" className="gap-2">
                  Visit Site
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-primary">{provider.fee}</div>
                  <div className="text-sm text-muted-foreground">Transfer Fee</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-secondary">{provider.time}</div>
                  <div className="text-sm text-muted-foreground">Delivery Time</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Supported Countries</h5>
                <div className="flex flex-wrap gap-2">
                  {provider.countries.map((country) => (
                    <Badge key={country} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Key Features</h5>
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

      {/* Country Specific Guides */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Country Guides</h2>
        
        <div className="grid gap-3">
          {[
            { country: "India", flag: "🇮🇳", currency: "INR", tips: "Use UPI for instant transfers" },
            { country: "Philippines", flag: "🇵🇭", currency: "PHP", tips: "GCash and bank transfers available" },
            { country: "China", flag: "🇨🇳", currency: "CNY", tips: "Alipay integration for convenience" },
            { country: "Bangladesh", flag: "🇧🇩", currency: "BDT", tips: "Mobile banking widely accepted" }
          ].map((guide) => (
            <Card key={guide.country} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{guide.flag}</span>
                    <div>
                      <h4 className="font-semibold">{guide.country}</h4>
                      <p className="text-sm text-muted-foreground">{guide.tips}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{guide.currency}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}