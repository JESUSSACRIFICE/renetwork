"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useProfileBasicInfoUpdate,
  type ProfileBasicInfoPayload,
} from "@/hooks/use-professional-profiles";

const basicInfoSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  company_name: z.string().optional(),
  license_number: z.string().optional(),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  userId: string;
  userEmail?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function BasicInfoForm({
  userId,
  userEmail,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: BasicInfoFormProps) {
  const { data: profile } = useProfile(userId);
  const updateBasicInfo = useProfileBasicInfoUpdate();

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      full_name: "",
      email: "",
      bio: "",
      phone: "",
      website: "",
      company_name: "",
      license_number: "",
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      full_name: profile.full_name ?? "",
      email: profile.email || userEmail || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      website: profile.website || "",
      company_name: profile.company_name || "",
      license_number: profile.license_number || "",
    });
  }, [profile, userEmail, form]);

  const onSubmit = (values: BasicInfoFormValues) => {
    const payload: ProfileBasicInfoPayload = {
      userId,
      full_name: values.full_name,
      email: values.email || undefined,
      bio: values.bio,
      phone: values.phone,
      website: values.website,
      company_name: values.company_name,
      license_number: values.license_number,
    };

    updateBasicInfo.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(1);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Basic Information</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                    disabled={updateBasicInfo.isPending}
                  >
                    {updateBasicInfo.isPending && (
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
