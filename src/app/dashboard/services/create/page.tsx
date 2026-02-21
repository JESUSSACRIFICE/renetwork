"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, usePspTypes } from "@/hooks/use-professional-profiles";
import { useCreateServiceWithPackages } from "@/hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PSPMultiSelect,
} from "@/components/hero/PSPMultiSelect";
import {
  PSP_OPTIONS_BY_LETTER,
  agentOptions,
  crowdfundingOptions,
  flooringIndoorOptions,
  flooringOutdoorOptions,
  realEstateOptions,
} from "@/lib/psp-types";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type UserType = "service_provider" | "agent";

interface PackageForm {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_days: number;
}

const defaultPackage = (): PackageForm => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  price: 0,
  delivery_days: 3,
});

export default function CreateServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profileData } = useProfile(user?.id ?? null);
  const profile = profileData ?? null;
  const userType: UserType = profile?.user_roles?.length
    ? "service_provider"
    : "agent";
  const providerId = user?.id ?? null;
  const { data: pspTypes = [] } = usePspTypes();
  const createService = useCreateServiceWithPackages(providerId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryLabels, setCategoryLabels] = useState<string[]>([]);
  const [agentLabels, setAgentLabels] = useState<string[]>([]);
  const [realEstateLabels, setRealEstateLabels] = useState<string[]>([]);
  const [crowdfundingLabels, setCrowdfundingLabels] = useState<string[]>([]);
  const [flooringIndoorLabels, setFlooringIndoorLabels] = useState<string[]>([]);
  const [flooringOutdoorLabels, setFlooringOutdoorLabels] = useState<string[]>([]);
  const [packages, setPackages] = useState<PackageForm[]>([defaultPackage()]);

  const addPackage = () => {
    if (packages.length >= 3) return;
    setPackages((p) => [...p, defaultPackage()]);
  };

  const removePackage = (id: string) => {
    if (packages.length <= 1) return;
    setPackages((p) => p.filter((x) => x.id !== id));
  };

  const updatePackage = (id: string, updates: Partial<PackageForm>) => {
    setPackages((p) => p.map((x) => (x.id === id ? { ...x, ...updates } : x)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (categoryLabels.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    const validPackages = packages.filter((p) => p.title.trim());
    if (validPackages.length === 0) {
      toast.error("Add at least one package with a title");
      return;
    }
    for (const pkg of validPackages) {
      const price = Number(pkg.price);
      if (Number.isNaN(price) || price < 0) {
        toast.error(`Invalid price in package "${pkg.title || "unnamed"}"`);
        return;
      }
      const days = Number(pkg.delivery_days);
      if (Number.isNaN(days) || days < 0) {
        toast.error(
          `Invalid delivery days in package "${pkg.title || "unnamed"}"`,
        );
        return;
      }
    }

    try {
      const categoryIds = categoryLabels
        .map((label) => pspTypes.find((pt) => pt.label === label)?.id)
        .filter((id): id is string => !!id);

      await createService.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        categoryIds,
        packages: validPackages.map((p) => ({
          title: p.title.trim(),
          description: p.description.trim() || null,
          price: Number(p.price),
          delivery_days: Number(p.delivery_days),
        })),
      });
      router.push("/dashboard/services");
    } catch {
      // Toast handled by hooks
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Create Service
        </h1>
        <p className="text-gray-600 mt-1">
          Add your service with packages (Basic, Standard, Premium) in one
          go.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="service-title">Title *</Label>
              <Input
                id="service-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Home Inspection"
              />
            </div>
            <div className="grid gap-2">
              <PSPMultiSelect
                label="Categories *"
                placeholder="Ex. Architect, Agent, Builder..."
                optionsByLetter={PSP_OPTIONS_BY_LETTER}
                value={categoryLabels}
                onChange={setCategoryLabels}
                agentValue={agentLabels}
                onAgentChange={setAgentLabels}
                agentOptions={agentOptions}
                realEstateValue={realEstateLabels}
                onRealEstateChange={setRealEstateLabels}
                realEstateOptions={realEstateOptions}
                crowdfundingValue={crowdfundingLabels}
                onCrowdfundingChange={setCrowdfundingLabels}
                crowdfundingOptions={crowdfundingOptions}
                flooringIndoorValue={flooringIndoorLabels}
                onFlooringIndoorChange={setFlooringIndoorLabels}
                flooringIndoorOptions={flooringIndoorOptions}
                flooringOutdoorValue={flooringOutdoorLabels}
                onFlooringOutdoorChange={setFlooringOutdoorLabels}
                flooringOutdoorOptions={flooringOutdoorOptions}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-image">Image URL (optional)</Label>
              <Input
                id="service-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Packages</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPackage}
                disabled={packages.length >= 3}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Add pricing tiers (e.g. Basic, Standard, Premium). At least
              one required, max 3.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="rounded-lg border p-4 space-y-4 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Package {idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePackage(pkg.id)}
                    disabled={packages.length <= 1}
                    aria-label="Remove package"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label>Title *</Label>
                  <Input
                    value={pkg.title}
                    onChange={(e) =>
                      updatePackage(pkg.id, { title: e.target.value })
                    }
                    placeholder="e.g. Basic, Standard, Premium"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={pkg.description}
                    onChange={(e) =>
                      updatePackage(pkg.id, {
                        description: e.target.value,
                      })
                    }
                    placeholder="What's included in this package..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={pkg.price === 0 ? "" : pkg.price}
                      onChange={(e) =>
                        updatePackage(pkg.id, {
                          price:
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Delivery (days)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={pkg.delivery_days}
                      onChange={(e) =>
                        updatePackage(pkg.id, {
                          delivery_days: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={createService.isPending}>
            {createService.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Service
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/services")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
