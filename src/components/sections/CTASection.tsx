import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-hero animate-on-scroll">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Start Your Journey to Financial Freedom Today
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of migrant workers in Singapore who are taking control of their finances. 
                Your future self will thank you.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="hero" size="xl" className="text-lg font-semibold hover-glow">
                🚀 Sign Up Free
              </Button>
              <Button variant="outline" size="xl" className="text-lg">
                📚 Learn More
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
              <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-2xl font-bold text-trust-blue mb-2">100% Free</div>
                <p className="text-sm text-muted-foreground">No hidden costs or premium features</p>
              </div>
              <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-2xl font-bold text-growth-green mb-2">2 Languages</div>
                <p className="text-sm text-muted-foreground">English and Mandarin supported</p>
              </div>
              <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-2xl font-bold text-singapore-gold mb-2">24/7 Access</div>
                <p className="text-sm text-muted-foreground">Learn at your own pace, anytime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;