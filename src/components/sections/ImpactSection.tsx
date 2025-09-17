import { Card, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/app";
import { useTheme } from "@/contexts/ThemeContext";

const ImpactSection = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl font-bold text-foreground mb-4">Real Impact, Real Stories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how FinLitSG has transformed the financial lives of workers across Singapore
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Success Stories */}
          <Card className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-4xl mb-4 text-center">💪</div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Maria's Success
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                "I saved $3,000 in 6 months using the budgeting tools. Now I can support my family better!"
              </p>
              <div className="bg-gradient-feature p-4 rounded-lg text-center text-secondary-foreground">
                <div className="text-2xl font-bold">$3,000</div>
                <div className="text-sm opacity-90">Saved in 6 months</div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300 animation-delay-200">
            <CardContent className="p-8">
              <div className="text-4xl mb-4 text-center">📊</div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Raj's Investment
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                "Started investing with just $100. Now my portfolio is growing steadily every month."
              </p>
              <div className="bg-gradient-hero p-4 rounded-lg text-center text-primary-foreground">
                <div className="text-2xl font-bold">15%</div>
                <div className="text-sm opacity-90">Annual returns</div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300 animation-delay-400">
            <CardContent className="p-8">
              <div className="text-4xl mb-4 text-center">🏠</div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Li Wei's Dream
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                "Learned to compare remittance rates. Saved $500 last year on transfer fees alone!"
              </p>
              <div className="bg-singapore-gold p-4 rounded-lg text-center text-white">
                <div className="text-2xl font-bold">$500</div>
                <div className="text-sm opacity-90">Saved on fees</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Statistics */}
        <div className="bg-gradient-card p-12 rounded-2xl border animate-on-scroll">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Our Community Impact</h3>
            <p className="text-lg text-muted-foreground">Together, we're building financial literacy across Singapore</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-on-scroll animation-delay-200">
              <div className="text-4xl font-bold text-primary mb-2">12,847</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="animate-on-scroll animation-delay-400">
              <div className="text-4xl font-bold text-growth-green mb-2">$2.4M</div>
              <div className="text-muted-foreground">Total Savings</div>
            </div>
            <div className="animate-on-scroll animation-delay-500">
              <div className="text-4xl font-bold text-singapore-gold mb-2">89%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div className="animate-on-scroll animation-delay-1000">
              <div className="text-4xl font-bold text-secondary mb-2">25+</div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
          </div>
        </div>
        
        {/* Original Impact Comparison */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-scroll">
            <Card className="shadow-card hover:shadow-hero transition-all duration-300">
              <CardContent className="p-8">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Many {APP_CONFIG.targetAudience} send most of their income home. Without financial awareness, 
                    they struggle to save or avoid high remittance fees.
                  </p>
                  <p className="text-lg text-foreground font-semibold mb-6">
                    This app provides <span className="text-primary">trusted, Singapore-specific tools</span> to make smarter money decisions.
                  </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-trust-blue rounded-full"></div>
                    <span className="text-muted-foreground">Reduce remittance costs by up to 80%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-growth-green rounded-full"></div>
                    <span className="text-muted-foreground">Build emergency savings faster</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-singapore-gold rounded-full"></div>
                    <span className="text-muted-foreground">Make informed investment decisions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="animate-on-scroll">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-destructive/20 shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <h3 className="text-lg font-semibold text-destructive">Without Financial Literacy</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• High remittance fees (5-10%)</li>
                    <li>• No emergency savings</li>
                    <li>• Vulnerable to scams</li>
                    <li>• Limited financial growth</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-growth-green/20 shadow-feature">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-growth-green rounded-full"></div>
                    <h3 className="text-lg font-semibold text-growth-green">With Financial Literacy</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Reduced fees (1-2%)</li>
                    <li>• 3-6 months emergency fund</li>
                    <li>• Protected from fraud</li>
                    <li>• Growing investments</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 bg-gradient-feature text-secondary-foreground p-6 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">Average Savings</div>
              <div className="text-3xl font-bold">$2,400</div>
              <div className="text-sm opacity-90">per year with proper financial planning</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;