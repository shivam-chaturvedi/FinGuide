import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, PiggyBank, Send, TrendingUp, Globe, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Country configurations (rates will be fetched live)
const countryConfigs = [
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳", symbol: "₹" },
  { code: "PH", name: "Philippines", currency: "PHP", flag: "🇵🇭", symbol: "₱" },
  { code: "CN", name: "China", currency: "CNY", flag: "🇨🇳", symbol: "¥" },
  { code: "ID", name: "Indonesia", currency: "IDR", flag: "🇮🇩", symbol: "Rp" },
  { code: "BD", name: "Bangladesh", currency: "BDT", flag: "🇧🇩", symbol: "৳" },
  { code: "MM", name: "Myanmar", currency: "MMK", flag: "🇲🇲", symbol: "K" },
  { code: "TH", name: "Thailand", currency: "THB", flag: "🇹🇭", symbol: "฿" },
  { code: "VN", name: "Vietnam", currency: "VND", flag: "🇻🇳", symbol: "₫" },
  { code: "MY", name: "Malaysia", currency: "MYR", flag: "🇲🇾", symbol: "RM" },
  { code: "PK", name: "Pakistan", currency: "PKR", flag: "🇵🇰", symbol: "₨" },
];

export default function Calculators() {
  // Exchange rates hook
  const { rates, loading: ratesLoading, error: ratesError, getRateForCurrency } = useExchangeRates();
  // Budget Calculator State
  const [budgetIncome, setBudgetIncome] = useState("");
  const [housing, setHousing] = useState("");
  const [food, setFood] = useState("");
  const [transport, setTransport] = useState("");
  const [remittanceBudget, setRemittanceBudget] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  
  // Savings Calculator State
  const [savingsAmount, setSavingsAmount] = useState("");
  const [savingsMonths, setSavingsMonths] = useState("");
  const [interestRate, setInterestRate] = useState("2");
  
  // Remittance Calculator State
  const [remittanceAmount, setRemittanceAmount] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countryConfigs[0]);
  const [customRate, setCustomRate] = useState("");
  const [transferFee, setTransferFee] = useState("15");

  // Create countries array with live rates
  const countries = countryConfigs.map(config => {
    const rate = getRateForCurrency(config.currency);
    return {
      ...config,
      rate
    };
  });

  // Update selected country when rates change
  useEffect(() => {
    if (rates.length > 0) {
      const updatedCountry = countries.find(c => c.code === selectedCountry.code);
      if (updatedCountry) {
        setSelectedCountry(updatedCountry);
      }
    }
  }, [rates, selectedCountry.code]);

  const calculateBudget = () => {
    const income = parseFloat(budgetIncome);
    const housingCost = parseFloat(housing) || 0;
    const foodCost = parseFloat(food) || 0;
    const transportCost = parseFloat(transport) || 0;
    const remittanceCost = parseFloat(remittanceBudget) || 0;
    const savingsTarget = parseFloat(savingsGoal) || 0;
    
    if (!income) return null;
    
    const totalExpenses = housingCost + foodCost + transportCost + remittanceCost + savingsTarget;
    const remaining = income - totalExpenses;
    
    return {
      income,
      expenses: {
        housing: housingCost,
        food: foodCost,
        transport: transportCost,
        remittance: remittanceCost,
        savings: savingsTarget,
        remaining: remaining > 0 ? remaining : 0
      },
      pieData: [
        { name: "Housing", value: housingCost, color: "hsl(var(--chart-1))" },
        { name: "Food", value: foodCost, color: "hsl(var(--chart-2))" },
        { name: "Transport", value: transportCost, color: "hsl(var(--chart-3))" },
        { name: "Remittance", value: remittanceCost, color: "hsl(var(--chart-4))" },
        { name: "Savings", value: savingsTarget, color: "hsl(var(--chart-5))" },
        { name: "Discretionary", value: remaining > 0 ? remaining : 0, color: "hsl(var(--muted))" }
      ].filter(item => item.value > 0),
      isOverBudget: totalExpenses > income,
      overBy: totalExpenses > income ? totalExpenses - income : 0
    };
  };

  const calculateSavings = () => {
    const monthly = parseFloat(savingsAmount);
    const months = parseFloat(savingsMonths);
    const rate = parseFloat(interestRate) / 100;
    
    if (!monthly || !months) return null;
    
    const years = months / 12;
    const totalContribution = monthly * months;
    const totalWithInterest = totalContribution * (1 + rate * years);
    const interest = totalWithInterest - totalContribution;
    
    // Generate month-by-month data for chart
    const chartData = [];
    for (let i = 1; i <= Math.min(months, 24); i++) {
      const contribution = monthly * i;
      const withInterest = contribution * (1 + rate * (i / 12));
      chartData.push({
        month: i,
        savings: contribution,
        withInterest: withInterest
      });
    }
    
    return {
      totalContribution: totalContribution.toFixed(0),
      totalWithInterest: totalWithInterest.toFixed(0),
      interest: interest.toFixed(0),
      chartData,
      monthlyGrowth: (totalWithInterest / months).toFixed(0)
    };
  };

  const calculateRemittance = () => {
    const sgd = parseFloat(remittanceAmount);
    const fee = parseFloat(transferFee);
    const rate = customRate ? parseFloat(customRate) : getRateForCurrency(selectedCountry.currency);
    
    if (!sgd) return null;
    
    const convertedAmount = sgd * rate;
    const totalCost = sgd + fee;
    const netReceived = (sgd - fee) * rate;
    
    return {
      country: selectedCountry,
      sentAmount: sgd,
      exchangeRate: rate,
      convertedAmount: convertedAmount.toFixed(2),
      transferFee: fee,
      totalCost: totalCost.toFixed(2),
      netReceived: netReceived.toFixed(2),
      feePercentage: ((fee / sgd) * 100).toFixed(1),
      chartData: [
        { name: "Amount Sent", value: sgd - fee, color: "hsl(var(--primary))" },
        { name: "Transfer Fee", value: fee, color: "hsl(var(--destructive))" }
      ]
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
        
        {/* Exchange Rate Status */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>Exchange Rates (Updated Jan 2025)</span>
        </div>

        {/* Exchange Rate Error Alert */}
        {ratesError && (
          <Alert className="mt-4 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {ratesError}. Using cached rates.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Calculator Tabs */}
      <Tabs defaultValue="remittance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="remittance">
            <Send className="h-4 w-4 mr-2" />
            Remittance
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Calculator className="h-4 w-4 mr-2" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="savings">
            <PiggyBank className="h-4 w-4 mr-2" />
            Savings
          </TabsTrigger>
        </TabsList>

        {/* Remittance Calculator */}
        <TabsContent value="remittance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Remittance Calculator
              </CardTitle>
              <CardDescription>
                Calculate how much your family receives when you send money from Singapore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remit-amount">Amount to Send (SGD)</Label>
                  <Input
                    id="remit-amount"
                    type="number"
                    placeholder="Enter amount in S$"
                    value={remittanceAmount}
                    onChange={(e) => setRemittanceAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Select value={selectedCountry.code} onValueChange={(value) => 
                    setSelectedCountry(countries.find(c => c.code === value) || countries[0])
                  }>
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.currency})
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            {country.flag} {country.name} ({country.currency})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exchange-rate">Exchange Rate (1 SGD = {selectedCountry.currency})</Label>
                  <Input
                    id="exchange-rate"
                    type="number"
                    placeholder={`Default: ${getRateForCurrency(selectedCountry.currency)}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-fee">Transfer Fee (SGD)</Label>
                  <Input
                    id="transfer-fee"
                    type="number"
                    placeholder="Transfer fee"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                  />
                </div>
              </div>
              
              {remittance && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                          {selectedCountry.symbol}{remittance.netReceived}
                        </div>
                        <div className="text-sm text-muted-foreground">Family Receives</div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Amount Sent:</span>
                        <span className="font-semibold">S${remittance.sentAmount}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Exchange Rate:</span>
                        <span className="font-semibold">1 SGD = {remittance.exchangeRate} {selectedCountry.currency}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Transfer Fee:</span>
                        <span className="font-semibold text-destructive">S${remittance.transferFee} ({remittance.feePercentage}%)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-primary/10 rounded font-semibold">
                        <span>Total Cost:</span>
                        <span>S${remittance.totalCost}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={remittance.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-center">
                      💡 <strong>Tip:</strong> Shop around for better exchange rates and lower fees. 
                      Consider services like Wise, Remitly, or bank transfers for better deals.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Calculator */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Budget Planner (Singapore)
              </CardTitle>
              <CardDescription>
                Plan your monthly income & expenses while living in Singapore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income (SGD)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="Your monthly salary"
                    value={budgetIncome}
                    onChange={(e) => setBudgetIncome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="housing">Housing (Rent/Room)</Label>
                  <Input
                    id="housing"
                    type="number"
                    placeholder="Monthly housing cost"
                    value={housing}
                    onChange={(e) => setHousing(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food">Food & Groceries</Label>
                  <Input
                    id="food"
                    type="number"
                    placeholder="Monthly food expenses"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport">Transport</Label>
                  <Input
                    id="transport"
                    type="number"
                    placeholder="MRT, Bus, Grab costs"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittance-budget">Remittance (Home)</Label>
                  <Input
                    id="remittance-budget"
                    type="number"
                    placeholder="Money sent home"
                    value={remittanceBudget}
                    onChange={(e) => setRemittanceBudget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings-goal">Savings Goal</Label>
                  <Input
                    id="savings-goal"
                    type="number"
                    placeholder="Monthly savings target"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(e.target.value)}
                  />
                </div>
              </div>
              
              {budget && (
                <div className="space-y-4 pt-4">
                  {budget.isOverBudget && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive font-semibold">
                        ⚠️ Over Budget by S${budget.overBy.toFixed(0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Consider reducing expenses in some categories.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-64">
                      <h4 className="text-sm font-semibold mb-2 text-center">Budget Breakdown</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budget.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {budget.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`S$${value}`, 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      {budget.pieData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-semibold">S${item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {budget.expenses.remaining > 0 && (
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-success font-semibold">
                        Great! You have S${budget.expenses.remaining.toFixed(0)} left for discretionary spending.
                      </p>
                    </div>
                  )}
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
                <PiggyBank className="h-5 w-5 text-success" />
                Savings Calculator (Low-Wage Focused)
              </CardTitle>
              <CardDescription>
                See how small, consistent savings in Singapore grow over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="savings-amount">Monthly Savings (SGD)</Label>
                  <Input
                    id="savings-amount"
                    type="number"
                    placeholder="Amount to save monthly"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings-months">Duration (Months)</Label>
                  <Input
                    id="savings-months"
                    type="number"
                    placeholder="Time period"
                    value={savingsMonths}
                    onChange={(e) => setSavingsMonths(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    placeholder="Annual interest rate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
              </div>
              
              {savings && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-success/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-success">S${savings.totalContribution}</div>
                        <div className="text-sm text-muted-foreground">Total Contributions</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">S${savings.interest}</div>
                        <div className="text-sm text-muted-foreground">Interest Earned</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-primary text-white">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">S${savings.totalWithInterest}</div>
                        <div className="text-sm opacity-90">Total Savings</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="h-64">
                    <h4 className="text-sm font-semibold mb-2 text-center">Savings Growth Over Time</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={savings.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`S$${Number(value).toFixed(0)}`, 'Amount']} />
                        <Line 
                          type="monotone" 
                          dataKey="savings" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                          name="Contributions Only"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="withInterest" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="With Interest"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        💡 <strong>If you save S$50 vs S$100 monthly:</strong><br/>
                        In {savingsMonths} months, the difference would be S${((parseFloat(savingsAmount) || 0) * (parseFloat(savingsMonths) || 0)).toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-sm text-success">
                        🎯 <strong>Motivation:</strong><br/>
                        In 12 months, you can send home an extra S${savings.monthlyGrowth} per month!
                      </p>
                    </div>
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