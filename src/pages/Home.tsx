import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calculator, Send, TrendingUp, Target, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="p-4 space-y-6">
      {/* Enhanced Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Welcome to FinGuide SG
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Empowering Migrant Workers with Financial Knowledge
        </p>
        <div className="bg-gradient-hero rounded-xl p-6 text-white shadow-glow">
          <h2 className="text-xl font-semibold mb-2">Start Your Financial Journey</h2>
          <p className="mb-4 opacity-90">Learn, Save, and Send Money Safely</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="secondary" size="lg" className="shadow-soft">
              <Link to="/modules">Start Learning</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/signup">Join Free</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Link to="/modules" className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Financial Modules
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn budgeting, savings, and investing basics
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <Link to="/calculators" className="flex items-center gap-4 group">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Calculator className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-secondary transition-colors">
                    Financial Calculators
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Budget planner and savings calculator
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <Link to="/remittances" className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Safe Remittances
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send money home safely and affordably
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Tip of the Day */}
      <Card className="bg-accent border-accent-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <TrendingUp className="h-5 w-5" />
            Tip of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-accent-foreground">
            Start with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. 
            This simple budgeting method helps you build financial stability.
          </p>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Learning Progress
          </CardTitle>
          <CardDescription>Keep up the great work!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Modules Completed</span>
            <span className="text-sm text-muted-foreground">2 of 8</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "25%" }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quizzes Passed</span>
            <span className="text-sm text-muted-foreground">3 of 8</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: "37.5%" }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}