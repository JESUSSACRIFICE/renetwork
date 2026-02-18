"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronDown } from "lucide-react";
import {
  useProfile,
  useProfileExperienceUpdate,
  type ProfileExperiencePayload,
} from "@/hooks/use-professional-profiles";

const experienceSchema = z.object({
  experience_level: z
    .enum(["expert", "mature", "seasonal", "new"])
    .optional()
    .default("new"),
  years_of_experience: z.number().min(0).optional().default(0),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function ExperienceForm({
  userId,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: ExperienceFormProps) {
  const { data: profile } = useProfile(userId);
  const updateExperience = useProfileExperienceUpdate();

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experience_level: "new",
      years_of_experience: 0,
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      experience_level:
        (profile.experience_level as ExperienceFormValues["experience_level"]) ||
        "new",
      years_of_experience: profile.years_of_experience ?? 0,
    });
  }, [profile, form]);

  const onSubmit = (values: ExperienceFormValues) => {
    const payload: ProfileExperiencePayload = {
      userId,
      experience_level: values.experience_level,
      years_of_experience: values.years_of_experience,
    };

    updateExperience.mutate(payload, {
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
            <CardTitle>Experience</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                            <SelectItem value="mature">Mature</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_of_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updateExperience.isPending}
                  >
                    {updateExperience.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save &amp; Continue
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
