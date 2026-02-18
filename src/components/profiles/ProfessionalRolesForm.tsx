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
import { useProfilePspTypesUpdate } from "@/hooks/use-professional-profiles";
import { PSP_OPTIONS_BY_LETTER } from "@/lib/psp-types";

interface ProfessionalRolesFormProps {
  userId: string;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function ProfessionalRolesForm({
  userId,
  selectedRoles,
  setSelectedRoles,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: ProfessionalRolesFormProps) {
  const updatePspTypes = useProfilePspTypesUpdate();

  const handleSubmit = () => {
    if (selectedRoles.length === 0) {
      return;
    }
    updatePspTypes.mutate(
      { userId, selectedPspLabels: selectedRoles },
      {
        onSuccess: () => {
          onSaveSuccess?.(2);
        },
      },
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Professional Types (PSP) *</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {Object.entries(PSP_OPTIONS_BY_LETTER).map(([letter, options]) => (
                <div key={letter} className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {letter}
                  </div>
                  <div className="space-y-1.5">
                    {options.map((label) => (
                      <div key={label} className="flex items-center space-x-2">
                        <Checkbox
                          id={label}
                          checked={selectedRoles.includes(label)}
                          onCheckedChange={(checked) => {
                            setSelectedRoles(
                              checked
                                ? [...selectedRoles, label]
                                : selectedRoles.filter((r) => r !== label),
                            );
                          }}
                        />
                        <label
                          htmlFor={label}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updatePspTypes.isPending || selectedRoles.length === 0}
              >
                {updatePspTypes.isPending && (
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
