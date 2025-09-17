import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Shield, Globe, Users } from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { useTheme } from "@/contexts/ThemeContext";

const AboutSection = () => {
  const { theme, isDark } = useTheme();
  
  const features = [
    {
      icon: BookOpen,
      title: "Financial Literacy Made Simple",
      description: "Learn savings, budgeting, and investing tailored to Singapore."
    },
    {
      icon: Shield,
      title: "Safe Remittances",
      description: "Compare and understand transfer fees from Singapore to India, Philippines, China, and more."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Switch between English and Mandarin instantly."
    },
    {
      icon: Users,
      title: "For Migrant Workers",
      description: "Tools built for FDWs and low-wage workers to better manage money."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why this App?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how {APP_CONFIG.name} transforms financial literacy for {APP_CONFIG.targetAudience}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-hero p-3 rounded-lg shadow-feature">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;