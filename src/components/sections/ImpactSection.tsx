import { Card, CardContent } from "@/components/ui/card";

const ImpactSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Financial Literacy Matters</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Understanding the real impact of financial education on migrant workers' lives
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-on-scroll">
              <Card className="shadow-card hover:shadow-hero transition-all duration-300">
                <CardContent className="p-8">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Many migrant workers in Singapore send most of their income home. Without financial awareness, 
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
            
            {/* Right Content - Comparison */}
            <div className="animate-on-scroll">
              <div className="grid grid-cols-1 gap-6">
                {/* Without Financial Literacy */}
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
                
                {/* With Financial Literacy */}
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
              
              {/* Impact Stats */}
              <div className="mt-6 bg-gradient-feature text-secondary-foreground p-6 rounded-lg text-center">
                <div className="text-2xl font-bold mb-2">Average Savings</div>
                <div className="text-3xl font-bold">$2,400</div>
                <div className="text-sm opacity-90">per year with proper financial planning</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;