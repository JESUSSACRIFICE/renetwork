"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
}

interface PreferenceRankingProps {
  categories: Category[];
  onRankingsChange?: (rankings: Record<string, number>) => void;
  initialRankings?: Record<string, number>;
  className?: string;
}

export function PreferenceRanking({
  categories,
  onRankingsChange,
  initialRankings = {},
  className,
}: PreferenceRankingProps) {
  const [rankings, setRankings] = useState<Record<string, number>>(
    initialRankings
  );

  const handleRankingChange = (categoryId: string, ranking: number) => {
    const newRankings = { ...rankings, [categoryId]: ranking };
    setRankings(newRankings);
    onRankingsChange?.(newRankings);
  };

  const getRankingLabel = (rank: number) => {
    if (rank === 1) return "1st Priority (Highest)";
    if (rank === 2) return "2nd Priority";
    if (rank === 3) return "3rd Priority";
    return `${rank}th Priority`;
  };

  const availableRanks = Array.from({ length: 10 }, (_, i) => i + 1);
  const usedRanks = new Set(Object.values(rankings));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Rank each category from 1-10, where 1 is your highest priority for recognition within the network.
        </p>
        <p className="text-xs text-muted-foreground">
          Each category should have a unique ranking.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-base font-medium flex-1">
                {category.label}
              </Label>
              <Select
                value={rankings[category.id]?.toString() || ""}
                onValueChange={(value) =>
                  handleRankingChange(category.id, parseInt(value))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {availableRanks.map((rank) => {
                    const isUsed = usedRanks.has(rank) && rankings[category.id] !== rank;
                    return (
                      <SelectItem
                        key={rank}
                        value={rank.toString()}
                        disabled={isUsed}
                      >
                        {getRankingLabel(rank)}
                        {isUsed && " (Already used)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {rankings[category.id] && (
              <p className="text-xs text-muted-foreground mt-2">
                Current priority: {getRankingLabel(rankings[category.id])}
              </p>
            )}
          </Card>
        ))}
      </div>

      {Object.keys(rankings).length === categories.length &&
        new Set(Object.values(rankings)).size === categories.length && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ All categories have been ranked with unique priorities!
            </p>
          </div>
        )}
    </div>
  );
}

