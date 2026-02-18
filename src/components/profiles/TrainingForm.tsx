"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
} from "@/components/ui/form";
import { Loader2, ChevronDown } from "lucide-react";
import {
  useProfile,
  useProfileTrainingUpdate,
  type ProfileTrainingPayload,
} from "@/hooks/use-professional-profiles";

const trainingSchema = z.object({
  willing_to_train: z.boolean().default(false),
  training_details: z.string().optional(),
});

export type TrainingFormValues = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function TrainingForm({
  userId,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: TrainingFormProps) {
  const { data: profile } = useProfile(userId);
  const updateTraining = useProfileTrainingUpdate();

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      willing_to_train: false,
      training_details: "",
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      willing_to_train: profile.willing_to_train ?? false,
      training_details: (profile as { training_details?: string }).training_details || "",
    });
  }, [profile, form]);

  const onSubmit = (values: TrainingFormValues) => {
    const payload: ProfileTrainingPayload = {
      userId,
      willing_to_train: values.willing_to_train,
      training_details: values.training_details,
    };

    updateTraining.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(6);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Training &amp; Mentorship</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="willing_to_train"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Willing to train referred parties</FormLabel>
                        <FormDescription>
                          Indicate if you&apos;re willing to provide training to
                          professionals you refer or receive referrals from.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("willing_to_train") && (
                  <FormField
                    control={form.control}
                    name="training_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe what type of training you offer..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updateTraining.isPending}
                  >
                    {updateTraining.isPending && (
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
