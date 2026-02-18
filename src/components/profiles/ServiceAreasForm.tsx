"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, Plus, X, ChevronDown } from "lucide-react";
import {
  useProfile,
  useProfileServiceAreasUpdate,
  type ProfileServiceAreasPayload,
} from "@/hooks/use-professional-profiles";
import { useEffect, useState } from "react";

interface ServiceAreaItem {
  zip_code: string;
  radius_miles: number;
}

interface ServiceAreasFormProps {
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function ServiceAreasForm({
  userId,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: ServiceAreasFormProps) {
  const { data: profile } = useProfile(userId);
  const updateServiceAreas = useProfileServiceAreasUpdate();

  const [serviceAreas, setServiceAreas] = useState<ServiceAreaItem[]>([
    { zip_code: "", radius_miles: 25 },
  ]);

  useEffect(() => {
    if (!profile) return;

    if (profile.service_areas?.length) {
      setServiceAreas(
        profile.service_areas.map((a) => ({
          zip_code: a.zip_code,
          radius_miles: a.radius_miles,
        })),
      );
    } else {
      setServiceAreas([{ zip_code: "", radius_miles: 25 }]);
    }
  }, [profile]);

  const addServiceArea = () => {
    setServiceAreas([...serviceAreas, { zip_code: "", radius_miles: 25 }]);
  };

  const removeServiceArea = (index: number) => {
    setServiceAreas(serviceAreas.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const payload: ProfileServiceAreasPayload = {
      userId,
      serviceAreas,
    };

    updateServiceAreas.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(5);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Service Areas</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {serviceAreas.map((area, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input
                    value={area.zip_code}
                    onChange={(e) => {
                      const newAreas = [...serviceAreas];
                      newAreas[index].zip_code = e.target.value;
                      setServiceAreas(newAreas);
                    }}
                    placeholder="90210"
                  />
                </div>
                <div className="w-32">
                  <label className="text-sm font-medium">Radius (mi)</label>
                  <Input
                    type="number"
                    min={1}
                    value={area.radius_miles}
                    onChange={(e) => {
                      const newAreas = [...serviceAreas];
                      newAreas[index].radius_miles =
                        parseInt(e.target.value) || 25;
                      setServiceAreas(newAreas);
                    }}
                  />
                </div>
                {serviceAreas.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServiceArea(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addServiceArea}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service Area
            </Button>

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updateServiceAreas.isPending}
              >
                {updateServiceAreas.isPending && (
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
