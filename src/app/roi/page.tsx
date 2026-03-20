"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ROIPage() {
  const [roiInputs, setRoiInputs] = useState({
    purchasePrice: "",
    monthlyRent: "",
    expenses: "",
    appreciation: "",
  });
  const [roiResult, setRoiResult] = useState<{
    cashFlow: number;
    roi: number;
    capRate: number;
  } | null>(null);

  const calculateROI = () => {
    const price = parseFloat(roiInputs.purchasePrice);
    const rent = parseFloat(roiInputs.monthlyRent);
    const expenses = parseFloat(roiInputs.expenses);
    const appreciation = parseFloat(roiInputs.appreciation || "0") / 100;

    const annualRent = rent * 12;
    const annualExpenses = expenses * 12;
    const cashFlow = annualRent - annualExpenses;
    const capRate = price > 0 ? (cashFlow / price) * 100 : 0;
    const totalReturn =
      price > 0 ? ((cashFlow + price * appreciation) / price) * 100 : 0;

    setRoiResult({
      cashFlow,
      roi: totalReturn,
      capRate,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="container py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="h-10 w-10" />
                ROI Calculator
              </h1>
              <p className="text-muted-foreground">
                Estimate returns on rental property investments. Use this tool to
                evaluate potential deals and compare opportunities.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Investment Inputs</CardTitle>
                <CardDescription>
                  Enter property and income details to calculate ROI, cash flow,
                  and cap rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="e.g. 250000"
                    value={roiInputs.purchasePrice}
                    onChange={(e) =>
                      setRoiInputs({ ...roiInputs, purchasePrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="e.g. 2000"
                    value={roiInputs.monthlyRent}
                    onChange={(e) =>
                      setRoiInputs({ ...roiInputs, monthlyRent: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="expenses">Monthly Expenses ($)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="e.g. 800"
                    value={roiInputs.expenses}
                    onChange={(e) =>
                      setRoiInputs({ ...roiInputs, expenses: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="appreciation">Annual Appreciation (%)</Label>
                  <Input
                    id="appreciation"
                    type="number"
                    placeholder="e.g. 3"
                    value={roiInputs.appreciation}
                    onChange={(e) =>
                      setRoiInputs({ ...roiInputs, appreciation: e.target.value })
                    }
                  />
                </div>
                <Button onClick={calculateROI} className="w-full">
                  Calculate ROI
                </Button>
                {roiResult !== null && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Annual Cash Flow
                      </p>
                      <p className="text-xl font-bold">
                        ${roiResult.cashFlow.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="text-xl font-bold">
                        {roiResult.capRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total ROI</p>
                      <p className="text-xl font-bold">
                        {roiResult.roi.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              Need more tools?{" "}
              <Link href="/tools" className="text-primary hover:underline">
                View all Real Estate Tools
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
