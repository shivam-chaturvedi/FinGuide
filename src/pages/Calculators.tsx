import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, PiggyBank, Send, TrendingUp } from "lucide-react";

export default function Calculators() {
  const [budgetIncome, setBudgetIncome] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [savingsMonths, setSavingsMonths] = useState("");
  const [remittanceAmount, setRemittanceAmount] = useState("");

  const calculateBudget = () => {
    const income = parseFloat(budgetIncome);
    if (!income) return null;
    
    return {
      needs: (income * 0.5).toFixed(0),
      wants: (income * 0.3).toFixed(0),
      savings: (income * 0.2).toFixed(0)
    };
  };

  const calculateSavings = () => {
    const monthly = parseFloat(savingsAmount);
    const months = parseFloat(savingsMonths);
    if (!monthly || !months) return null;
    
    return {
      total: (monthly * months).toFixed(0),
      interest: ((monthly * months) * 0.02).toFixed(0) // Assume 2% annual interest
    };
  };

  const calculateRemittance = () => {
    const sgd = parseFloat(remittanceAmount);
    if (!sgd) return null;
    
    return {
      inr: (sgd * 61.5).toFixed(0), // Example rate
      php: (sgd * 42.3).toFixed(0), // Example rate  
      cny: (sgd * 5.4).toFixed(0), // Example rate
      fee: (sgd * 0.02).toFixed(2) // 2% fee
    };
  };

  const budget = calculateBudget();
  const savings = calculateSavings();
  const remittance = calculateRemittance();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Financial Calculators</h1>
        <p className="text-muted-foreground">Plan your finances with smart tools</p>
      </div>

      {/* Calculator Tabs */}
      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="remittance">Remittance</TabsTrigger>
        </TabsList>

        {/* Budget Calculator */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Budget Planner
              </CardTitle>
              <CardDescription>
                Plan your monthly budget using the 50/30/20 rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (SGD)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={budgetIncome}
                  onChange={(e) => setBudgetIncome(e.target.value)}
                />
              </div>
              
              {budget && (
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Card className="bg-primary/5">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-primary">${budget.needs}</div>
                      <div className="text-sm text-muted-foreground">Needs (50%)</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/5">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-secondary">${budget.wants}</div>
                      <div className="text-sm text-muted-foreground">Wants (30%)</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-success/10">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-success">${budget.savings}</div>
                      <div className="text-sm text-muted-foreground">Savings (20%)</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Calculator */}
        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-secondary" />
                Savings Calculator
              </CardTitle>
              <CardDescription>
                See how your savings grow over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="savings-amount">Monthly Savings (SGD)</Label>
                  <Input
                    id="savings-amount"
                    type="number"
                    placeholder="Amount to save"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings-months">Time Period (Months)</Label>
                  <Input
                    id="savings-months"
                    type="number"
                    placeholder="Number of months"
                    value={savingsMonths}
                    onChange={(e) => setSavingsMonths(e.target.value)}
                  />
                </div>
              </div>
              
              {savings && (
                <Card className="bg-gradient-secondary text-white mt-4">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2">${savings.total}</div>
                    <div className="text-sm opacity-90">Total Savings</div>
                    <div className="text-sm opacity-75 mt-1">
                      + ${savings.interest} potential interest
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remittance Calculator */}
        <TabsContent value="remittance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Remittance Calculator
              </CardTitle>
              <CardDescription>
                Calculate how much your family receives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remit-amount">Amount to Send (SGD)</Label>
                <Input
                  id="remit-amount"
                  type="number"
                  placeholder="Enter amount in SGD"
                  value={remittanceAmount}
                  onChange={(e) => setRemittanceAmount(e.target.value)}
                />
              </div>
              
              {remittance && (
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">To India (INR)</span>
                    <span className="text-lg font-bold">₹{remittance.inr}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">To Philippines (PHP)</span>
                    <span className="text-lg font-bold">₱{remittance.php}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">To China (CNY)</span>
                    <span className="text-lg font-bold">¥{remittance.cny}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center pt-2">
                    Estimated transfer fee: ${remittance.fee}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}