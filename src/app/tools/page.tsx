"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Home, TrendingUp, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tools() {
  const [mortgageInputs, setMortgageInputs] = useState({
    price: "",
    downPayment: "",
    interestRate: "",
    years: "30"
  });
  const [mortgageResult, setMortgageResult] = useState<number | null>(null);

  const [roiInputs, setRoiInputs] = useState({
    purchasePrice: "",
    monthlyRent: "",
    expenses: "",
    appreciation: ""
  });
  const [roiResult, setRoiResult] = useState<{
    cashFlow: number;
    roi: number;
    capRate: number;
  } | null>(null);

  const calculateMortgage = () => {
    const price = parseFloat(mortgageInputs.price);
    const down = parseFloat(mortgageInputs.downPayment);
    const rate = parseFloat(mortgageInputs.interestRate) / 100 / 12;
    const months = parseInt(mortgageInputs.years) * 12;

    const principal = price - down;
    const payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    setMortgageResult(payment);
  };

  const calculateROI = () => {
    const price = parseFloat(roiInputs.purchasePrice);
    const rent = parseFloat(roiInputs.monthlyRent);
    const expenses = parseFloat(roiInputs.expenses);
    const appreciation = parseFloat(roiInputs.appreciation) / 100;

    const annualRent = rent * 12;
    const annualExpenses = expenses * 12;
    const cashFlow = annualRent - annualExpenses;
    const capRate = (cashFlow / price) * 100;
    const totalReturn = ((cashFlow + (price * appreciation)) / price) * 100;

    setRoiResult({
      cashFlow,
      roi: totalReturn,
      capRate
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real Estate Tools</h1>
          <p className="text-muted-foreground">
            Essential calculators and resources for real estate professionals
          </p>
        </div>

        <Tabs defaultValue="mortgage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="mortgage">
              <Calculator className="mr-2 h-4 w-4" />
              Mortgage
            </TabsTrigger>
            <TabsTrigger value="roi">
              <TrendingUp className="mr-2 h-4 w-4" />
              ROI
            </TabsTrigger>
            <TabsTrigger value="valuation">
              <Home className="mr-2 h-4 w-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mortgage">
            <Card>
              <CardHeader>
                <CardTitle>Mortgage Calculator</CardTitle>
                <CardDescription>
                  Calculate monthly mortgage payments based on loan amount, interest rate, and term
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Property Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="350000"
                      value={mortgageInputs.price}
                      onChange={(e) => setMortgageInputs({ ...mortgageInputs, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="down">Down Payment</Label>
                    <Input
                      id="down"
                      type="number"
                      placeholder="70000"
                      value={mortgageInputs.downPayment}
                      onChange={(e) => setMortgageInputs({ ...mortgageInputs, downPayment: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Interest Rate (%)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="6.5"
                      value={mortgageInputs.interestRate}
                      onChange={(e) => setMortgageInputs({ ...mortgageInputs, interestRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="years">Loan Term (Years)</Label>
                    <Input
                      id="years"
                      type="number"
                      placeholder="30"
                      value={mortgageInputs.years}
                      onChange={(e) => setMortgageInputs({ ...mortgageInputs, years: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={calculateMortgage}>Calculate</Button>
                {mortgageResult !== null && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-3xl font-bold">
                      ${mortgageResult.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi">
            <Card>
              <CardHeader>
                <CardTitle>ROI Calculator</CardTitle>
                <CardDescription>
                  Calculate return on investment for rental properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase">Purchase Price</Label>
                    <Input
                      id="purchase"
                      type="number"
                      placeholder="300000"
                      value={roiInputs.purchasePrice}
                      onChange={(e) => setRoiInputs({ ...roiInputs, purchasePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rent">Monthly Rent</Label>
                    <Input
                      id="rent"
                      type="number"
                      placeholder="2500"
                      value={roiInputs.monthlyRent}
                      onChange={(e) => setRoiInputs({ ...roiInputs, monthlyRent: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses">Monthly Expenses</Label>
                    <Input
                      id="expenses"
                      type="number"
                      placeholder="1200"
                      value={roiInputs.expenses}
                      onChange={(e) => setRoiInputs({ ...roiInputs, expenses: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appreciation">Annual Appreciation (%)</Label>
                    <Input
                      id="appreciation"
                      type="number"
                      step="0.1"
                      placeholder="3.5"
                      value={roiInputs.appreciation}
                      onChange={(e) => setRoiInputs({ ...roiInputs, appreciation: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={calculateROI}>Calculate ROI</Button>
                {roiResult !== null && (
                  <div className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                        <p className="text-2xl font-bold">
                          ${roiResult.cashFlow.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Cap Rate</p>
                        <p className="text-2xl font-bold">
                          {roiResult.capRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total ROI</p>
                        <p className="text-2xl font-bold">
                          {roiResult.roi.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="valuation">
            <Card>
              <CardHeader>
                <CardTitle>Property Valuation Tool</CardTitle>
                <CardDescription>
                  Coming soon - Estimate property values based on market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This tool is under development and will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>
                  Download essential real estate documents and templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Coming soon - Access purchase agreements, disclosure forms, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}



