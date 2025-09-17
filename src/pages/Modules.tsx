import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, CheckCircle, Lock, Play } from "lucide-react";

interface Module {
  id: string;
  title: string;
  titleCN: string;
  description: string;
  descriptionCN: string;
  duration: string;
  progress: number;
  status: "completed" | "in-progress" | "locked";
  category: "basics" | "management" | "remittance" | "advanced";
}

const modules: Module[] = [
  {
    id: "1",
    title: "Understanding Money",
    titleCN: "理解金钱",
    description: "Learn the basics of money management and financial planning",
    descriptionCN: "学习理财和财务规划的基础知识",
    duration: "15 min",
    progress: 100,
    status: "completed",
    category: "basics"
  },
  {
    id: "2",
    title: "Creating a Budget",
    titleCN: "制定预算",
    description: "How to create and stick to a monthly budget",
    descriptionCN: "如何制定和坚持月度预算",
    duration: "20 min",
    progress: 60,
    status: "in-progress",
    category: "basics"
  },
  {
    id: "3",
    title: "Savings Strategies",
    titleCN: "储蓄策略",
    description: "Smart ways to save money and build emergency funds",
    descriptionCN: "明智的储蓄方法和建立应急基金",
    duration: "18 min",
    progress: 0,
    status: "locked",
    category: "management"
  },
  {
    id: "4",
    title: "Safe Remittances to India",
    titleCN: "安全汇款到印度",
    description: "Best practices for sending money to India safely and affordably",
    descriptionCN: "安全且经济地向印度汇款的最佳做法",
    duration: "25 min",
    progress: 0,
    status: "locked",
    category: "remittance"
  },
];

const categoryColors = {
  basics: "bg-primary/10 text-primary",
  management: "bg-secondary/10 text-secondary",
  remittance: "bg-accent/50 text-accent-foreground",
  advanced: "bg-muted text-muted-foreground"
};

const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-success" />,
  "in-progress": <Play className="h-5 w-5 text-primary" />,
  locked: <Lock className="h-5 w-5 text-muted-foreground" />
};

export default function Modules() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Modules", labelCN: "所有课程" },
    { id: "basics", label: "Basics", labelCN: "基础" },
    { id: "management", label: "Management", labelCN: "管理" },
    { id: "remittance", label: "Remittance", labelCN: "汇款" },
  ];

  const filteredModules = selectedCategory === "all" 
    ? modules 
    : modules.filter(module => module.category === selectedCategory);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Financial Modules</h1>
        <p className="text-muted-foreground">Learn at your own pace with interactive lessons</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.map((module) => (
          <Card key={module.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcons[module.status]}
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  <CardDescription className="mb-2">
                    {module.description}
                  </CardDescription>
                  <div className="flex items-center gap-4">
                    <Badge className={categoryColors[module.category]}>
                      {module.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {module.duration}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {module.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant={module.status === "completed" ? "secondary" : "default"}
                  disabled={module.status === "locked"}
                >
                  {module.status === "completed" ? "Review" : 
                   module.status === "in-progress" ? "Continue" : 
                   "Start Module"}
                </Button>
                
                {module.status === "completed" && (
                  <Button variant="outline" size="sm">
                    Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}