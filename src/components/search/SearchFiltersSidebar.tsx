"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchFiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  datePosted: string[];
  responseTime: string;
  deliveryTime: string;
  budget: [number, number];
  englishLevel: string;
}

const categories = [
  "Design & Creative",
  "Development & IT",
  "Digital Marketing",
  "Finance & Accounting",
  "Lifestyle",
  "Music & Audio",
  "Programming & Tech",
  "Writing & Translation",
];

const datePostedOptions = [
  "Last Hour",
  "Last 24 hours",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last 60 days",
];

const responseTimeOptions = [
  "Within 1 hour",
  "Within 2 hours",
  "Within 4 hours",
  "Within 8 hours",
  "Within 24 hours",
];

const deliveryTimeOptions = [
  "1 day",
  "2 days",
  "3 days",
  "1 week",
  "2 weeks",
  "1 month",
];

const englishLevelOptions = [
  "Basic",
  "Conversational",
  "Fluent",
  "Native",
];

export default function SearchFiltersSidebar({ isOpen, onClose, onApplyFilters }: SearchFiltersSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDatePosted, setSelectedDatePosted] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState<string>("");
  const [deliveryTime, setDeliveryTime] = useState<string>("");
  const [budget, setBudget] = useState<[number, number]>([0, 5000]);
  const [englishLevel, setEnglishLevel] = useState<string>("");
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreDatePosted, setShowMoreDatePosted] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleDatePostedToggle = (date: string) => {
    setSelectedDatePosted((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleApplyFilters = () => {
    const filters: FilterState = {
      categories: selectedCategories,
      datePosted: selectedDatePosted,
      responseTime,
      deliveryTime,
      budget,
      englishLevel,
    };
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedDatePosted([]);
    setResponseTime("");
    setDeliveryTime("");
    setBudget([0, 5000]);
    setEnglishLevel("");
  };

  const displayedCategories = showMoreCategories ? categories : categories.slice(0, 5);
  const displayedDatePosted = showMoreDatePosted ? datePostedOptions : datePostedOptions.slice(0, 4);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r z-50 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">All Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Categories */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Categories</Label>
              <div className="space-y-3">
                {displayedCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
                {categories.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={() => setShowMoreCategories(!showMoreCategories)}
                  >
                    {showMoreCategories ? "- Show less" : "+ Show more"}
                  </Button>
                )}
              </div>
            </div>

            {/* Date Posted */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Date Posted</Label>
              <div className="space-y-3">
                {displayedDatePosted.map((date) => (
                  <div key={date} className="flex items-center space-x-2">
                    <Checkbox
                      id={`date-${date}`}
                      checked={selectedDatePosted.includes(date)}
                      onCheckedChange={() => handleDatePostedToggle(date)}
                    />
                    <Label
                      htmlFor={`date-${date}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {date}
                    </Label>
                  </div>
                ))}
                {datePostedOptions.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={() => setShowMoreDatePosted(!showMoreDatePosted)}
                  >
                    {showMoreDatePosted ? "- Show less" : "+ Show More"}
                  </Button>
                )}
              </div>
            </div>

            {/* Response Time */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Response Time</Label>
              <Select value={responseTime} onValueChange={setResponseTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Response Time" />
                </SelectTrigger>
                <SelectContent>
                  {responseTimeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Time */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Delivery Time</Label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery Time" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTimeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Budget</Label>
              <div className="space-y-4">
                <Slider
                  value={budget}
                  onValueChange={(value) => setBudget(value as [number, number])}
                  min={0}
                  max={5000}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">${budget[0]}</span>
                  <span className="font-medium">${budget[1]}</span>
                </div>
              </div>
            </div>

            {/* English Level */}
            <div>
              <Label className="text-base font-semibold mb-3 block">English Level</Label>
              <Select value={englishLevel} onValueChange={setEnglishLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="English Level" />
                </SelectTrigger>
                <SelectContent>
                  {englishLevelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-2">
          <Button onClick={handleApplyFilters} className="w-full bg-primary hover:bg-primary/90">
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="w-full">
            Clear All
          </Button>
        </div>
      </div>
    </>
  );
}

