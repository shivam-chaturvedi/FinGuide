import { Card, CardContent } from "@/components/ui/card";

const PurposeSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Purpose</h2>
          </div>
          
          <Card className="shadow-card hover:shadow-hero transition-all duration-300 animate-on-scroll">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="text-lg text-muted-foreground leading-relaxed">
                    <p className="mb-6">
                      The purpose of this app is to spread <span className="font-semibold text-primary">financial literacy among migrant workers in Singapore</span>. 
                    </p>
                    <p>
                      It empowers workers with knowledge to save, budget, invest, and safely send money home. We believe everyone deserves access to financial education, regardless of their background or income level.
                    </p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gradient-hero text-primary-foreground p-4 rounded-lg">
                      <div className="text-2xl font-bold">10k+</div>
                      <div className="text-sm opacity-90">Workers Helped</div>
                    </div>
                    <div className="bg-gradient-feature text-secondary-foreground p-4 rounded-lg">
                      <div className="text-2xl font-bold">15+</div>
                      <div className="text-sm opacity-90">Countries Supported</div>
                    </div>
                    <div className="bg-singapore-gold text-white p-4 rounded-lg">
                      <div className="text-2xl font-bold">$2M+</div>
                      <div className="text-sm opacity-90">Money Saved</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-card p-8 rounded-2xl border">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📱</div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        Financial Freedom Starts Here
                      </h3>
                      <p className="text-muted-foreground">
                        Join thousands of migrant workers who have taken control of their finances through education and smart planning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PurposeSection;