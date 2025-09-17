import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Settings, BookOpen, Calculator, Trophy, Globe, LogOut } from "lucide-react";

const achievements = [
  { icon: "🎯", title: "First Module", description: "Completed your first learning module", earned: true },
  { icon: "💰", title: "Budget Master", description: "Created your first budget plan", earned: true },
  { icon: "📊", title: "Calculator Pro", description: "Used all financial calculators", earned: false },
  { icon: "🏆", title: "Quiz Champion", description: "Passed all module quizzes", earned: false },
];

const recentActivity = [
  { action: "Completed", item: "Understanding Money module", date: "2 days ago", type: "module" },
  { action: "Used", item: "Budget Calculator", date: "3 days ago", type: "calculator" },
  { action: "Started", item: "Creating a Budget module", date: "1 week ago", type: "module" },
];

export default function Profile() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-gradient-hero mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
        <p className="text-muted-foreground">Learning since March 2024</p>
        <Badge className="mt-2 bg-primary/10 text-primary">
          <Globe className="h-3 w-3 mr-1" />
          English
        </Badge>
      </div>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Learning Progress
          </CardTitle>
          <CardDescription>Your financial education journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Modules Completed</span>
              <span className="text-sm text-muted-foreground">2 of 8</span>
            </div>
            <Progress value={25} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quizzes Passed</span>
              <span className="text-sm text-muted-foreground">3 of 8</span>
            </div>
            <Progress value={37.5} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">25</div>
              <div className="text-xs text-muted-foreground">Study Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">12</div>
              <div className="text-xs text-muted-foreground">Calculations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-growth-green">2</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-secondary" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock badges as you learn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border text-center transition-colors ${
                  achievement.earned 
                    ? "bg-accent/50 border-accent-foreground/20" 
                    : "bg-muted/50 border-muted opacity-60"
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-sm">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your learning history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.type === "module" ? "bg-primary/10" : "bg-secondary/10"
                }`}>
                  {activity.type === "module" ? (
                    <BookOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Calculator className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.action}</span> {activity.item}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Settings className="h-4 w-4" />
          Account Settings
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3">
          <Globe className="h-4 w-4" />
          Language Preferences
        </Button>
        <Button variant="destructive" className="w-full justify-start gap-3">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}