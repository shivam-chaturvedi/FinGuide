import { Card, CardContent } from "@/components/ui/card";
import { Lock, BookOpen, Calculator, Globe, Target } from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { useTheme } from "@/contexts/ThemeContext";

const FeaturesSection = () => {
  const { theme } = useTheme();
  
  const features = [
    {
      icon: Lock,
      title: "Secure Registration & Login",
      description: "Sign up with phone/email + OTP for maximum security.",
      color: "text-trust-blue"
    },
    {
      icon: BookOpen,
      title: "Modules & Quizzes",
      description: "Fun lessons on finance + short quizzes to test your knowledge.",
      color: "text-growth-green"
    },
    {
      icon: Calculator,
      title: "Financial Calculators",
      description: "Remittance, Budget Planner, and Savings Calculator tools.",
      color: "text-singapore-gold"
    },
    {
      icon: Globe,
      title: "Language Translation",
      description: "English ↔ Mandarin, easy toggle for your comfort.",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Singapore-Specific Content",
      description: "Tips & guides relevant to life and work in Singapore.",
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl font-bold text-foreground mb-4">Features You'll Love</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools and features designed to make financial learning simple and effective
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <feature.icon className={`h-12 w-12 mx-auto ${feature.color} group-hover:scale-110 transition-transform duration-200`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlight Banner */}
        <div className="mt-16 animate-on-scroll">
          <Card className="bg-gradient-hero text-primary-foreground shadow-hero">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">🎯 Built for {APP_CONFIG.targetAudience}</h3>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Every feature is designed with the unique needs of {APP_CONFIG.targetAudience} in mind. 
                From local banking knowledge to remittance comparisons, we've got you covered.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;