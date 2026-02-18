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
import { Loader2, ChevronDown } from "lucide-react";
import {
  useProfile,
  useProfilePricingUpdate,
  type ProfilePricingPayload,
} from "@/hooks/use-professional-profiles";

const pricingSchema = z.object({
  referral_fee_percentage: z.number().min(0).max(100).optional().default(30),
  hourly_rate: z.number().min(0).optional(),
  price_per_sqft: z.number().min(0).optional(),
});

export type PricingFormValues = z.infer<typeof pricingSchema>;

interface PricingFormProps {
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function PricingForm({
  userId,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: PricingFormProps) {
  const { data: profile } = useProfile(userId);
  const updatePricing = useProfilePricingUpdate();

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      referral_fee_percentage: 30,
      hourly_rate: undefined,
      price_per_sqft: undefined,
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      referral_fee_percentage: profile.referral_fee_percentage ?? 30,
      hourly_rate: profile.hourly_rate ?? undefined,
      price_per_sqft: profile.price_per_sqft ?? undefined,
    });
  }, [profile, form]);

  const onSubmit = (values: PricingFormValues) => {
    const payload: ProfilePricingPayload = {
      userId,
      referral_fee_percentage: values.referral_fee_percentage,
      hourly_rate: values.hourly_rate,
      price_per_sqft: values.price_per_sqft,
    };

    updatePricing.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(4);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Pricing</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="referral_fee_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Fee %</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            max={100}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step={0.01}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_sqft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Sq Ft ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step={0.01}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined,
                              )
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
                    disabled={updatePricing.isPending}
                  >
                    {updatePricing.isPending && (
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
