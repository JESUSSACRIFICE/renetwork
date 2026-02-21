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
  useProfileSkillsUpdate,
  useSkillsList,
  type ProfileSkillsPayload,
} from "@/hooks/use-professional-profiles";

interface SkillsFormProps {
  userId: string;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function SkillsForm({
  userId,
  selectedSkills,
  setSelectedSkills,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: SkillsFormProps) {
  const updateSkills = useProfileSkillsUpdate();
  const { data: skillsList, isLoading: skillsLoading } = useSkillsList();

  const handleSubmit = () => {
    const payload: ProfileSkillsPayload = {
      userId,
      selectedSkillLabels: selectedSkills,
    };

    updateSkills.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(3);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Skills</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the skills that best describe your professional expertise.
            </p>
            {skillsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {(skillsList ?? []).map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={skill.id}
                      checked={selectedSkills.includes(skill.label)}
                      onCheckedChange={(checked) => {
                        setSelectedSkills(
                          checked
                            ? [...selectedSkills, skill.label]
                            : selectedSkills.filter((s) => s !== skill.label),
                        );
                      }}
                    />
                    <label
                      htmlFor={skill.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {skill.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updateSkills.isPending || skillsLoading}
              >
                {updateSkills.isPending && (
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
