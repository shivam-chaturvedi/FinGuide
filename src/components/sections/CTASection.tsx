import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:30px_30px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-on-scroll">
          <h2 className="text-5xl font-bold mb-6">Ready to Take Control?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of migrant workers who are already building a better financial future in Singapore. 
            Start your journey today - it's completely free!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button variant="secondary" size="xl" className="text-lg font-semibold shadow-feature">
              🚀 Start Learning Free
            </Button>
            <Button variant="outline-hero" size="xl" className="text-lg border-2">
              📱 Download App
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center animate-on-scroll animation-delay-200">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-2">100% Secure</h4>
              <p className="text-sm opacity-80">Bank-level security for all your data</p>
            </div>
            <div className="text-center animate-on-scroll animation-delay-400">
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-semibold mb-2">Always Free</h4>
              <p className="text-sm opacity-80">No hidden fees, no premium plans</p>
            </div>
            <div className="text-center animate-on-scroll animation-delay-500">
              <div className="text-3xl mb-2">🌍</div>
              <h4 className="font-semibold mb-2">Multi-Language</h4>
              <p className="text-sm opacity-80">Available in English and Mandarin</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float animation-delay-500">
        <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          💰 Smart Savings
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-float animation-delay-1000">
        <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          📊 Better Budgets
        </div>
      </div>
    </section>
  );
};

export default CTASection;