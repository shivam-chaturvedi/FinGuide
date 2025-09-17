import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Calculator, TrendingUp, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const ScopeSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const learningModules = [
    {
      icon: PiggyBank,
      title: "Savings",
      description: "Understand how to set aside money while in Singapore.",
      color: "bg-trust-blue"
    },
    {
      icon: Calculator,
      title: "Budgeting", 
      description: "Plan your monthly income and expenses smartly.",
      color: "bg-growth-green"
    },
    {
      icon: TrendingUp,
      title: "Investment Basics",
      description: "Learn safe and simple investment opportunities.",
      color: "bg-singapore-gold"
    },
    {
      icon: Send,
      title: "Remittances",
      description: "Send money safely to India, Philippines, China, and more.",
      color: "bg-primary"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % learningModules.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + learningModules.length) % learningModules.length);
  };

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl font-bold text-foreground mb-4">What You'll Learn</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive financial education modules designed specifically for your journey in Singapore
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden mb-8">
          <div className="relative animate-on-scroll">
            <Card className="shadow-card hover:shadow-hero transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className={`${learningModules[currentIndex].color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {(() => {
                      const IconComponent = learningModules[currentIndex].icon;
                      return <IconComponent className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {learningModules[currentIndex].title}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {learningModules[currentIndex].description}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center items-center mt-6 gap-4">
              <Button onClick={prevSlide} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {learningModules.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <Button onClick={nextSlide} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {learningModules.map((module, index) => (
            <Card 
              key={index}
              className="animate-on-scroll hover-scale shadow-card hover:shadow-hero transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className={`${module.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  {(() => {
                    const IconComponent = module.icon;
                    return <IconComponent className="h-8 w-8 text-white" />;
                  })()}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {module.title}
                </h3>
                <p className="text-muted-foreground">
                  {module.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScopeSection;