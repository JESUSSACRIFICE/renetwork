"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import {
  useProfileLanguagesUpdate,
  type ProfileLanguagesPayload,
} from "@/hooks/use-professional-profiles";

const LANGUAGES = [
  "English",
  "Spanish",
  "Chinese",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
];

interface LanguagesFormProps {
  userId: string;
  selectedLanguages: string[];
  setSelectedLanguages: (languages: string[]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: () => void;
}

export function LanguagesForm({
  userId,
  selectedLanguages,
  setSelectedLanguages,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: LanguagesFormProps) {
  const updateLanguages = useProfileLanguagesUpdate();

  const handleSubmit = () => {
    const payload: ProfileLanguagesPayload = {
      userId,
      selectedLanguages,
    };

    updateLanguages.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.();
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Languages</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={lang}
                    checked={selectedLanguages.includes(lang)}
                    onCheckedChange={(checked) => {
                      setSelectedLanguages(
                        checked
                          ? [...selectedLanguages, lang]
                          : selectedLanguages.filter((l) => l !== lang),
                      );
                    }}
                  />
                  <label
                    htmlFor={lang}
                    className="text-sm font-medium"
                  >
                    {lang}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updateLanguages.isPending}
              >
                {updateLanguages.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save &amp; Continue
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
