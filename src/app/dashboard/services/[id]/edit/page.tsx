"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, usePspTypes } from "@/hooks/use-professional-profiles";
import {
  useMyService,
  useUpdateService,
  useDeleteService,
  useServiceCategories,
  updateServiceCategories,
} from "@/hooks/use-services";
import {
  useServicePackages,
  useCreateServicePackage,
  useUpdateServicePackage,
  useDeleteServicePackage,
  type ServicePackageRow,
} from "@/hooks/use-service-packages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PSPMultiSelect } from "@/components/hero/PSPMultiSelect";
import {
  PSP_OPTIONS_BY_LETTER,
  agentOptions,
  crowdfundingOptions,
  flooringIndoorOptions,
  flooringOutdoorOptions,
  realEstateOptions,
} from "@/lib/psp-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type UserType = "service_provider" | "agent";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const serviceId = params?.id as string | undefined;
  const { user, isLoading: authLoading } = useAuth();
  const { data: profileData } = useProfile(user?.id ?? null);
  const profile = profileData ?? null;
  const userType: UserType = profile?.user_roles?.length
    ? "service_provider"
    : "agent";
  const providerId = user?.id ?? null;
  const { data: pspTypes = [] } = usePspTypes();
  const { data: categoryIds = [] } = useServiceCategories(serviceId ?? null);
  const { data: service, isLoading: serviceLoading } = useMyService(
    providerId,
    serviceId ?? null,
  );
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const { data: packages = [], isLoading: packagesLoading } =
    useServicePackages(serviceId ?? null);
  const createPackage = useCreateServicePackage(serviceId ?? null);
  const updatePackage = useUpdateServicePackage(serviceId ?? null);
  const deletePackage = useDeleteServicePackage(serviceId ?? null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    image_url: "",
    delivery_days: null as number | null,
  });
  const [selectedCategoryLabels, setSelectedCategoryLabels] = useState<
    string[]
  >([]);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<ServicePackageRow | null>(null);
  const [packageForm, setPackageForm] = useState({
    title: "",
    description: "",
    price: 0,
    delivery_days: 3,
  });
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title,
        description: service.description ?? "",
        price: service.price,
        image_url: service.image_url ?? "",
        delivery_days: service.delivery_days,
      });
    }
  }, [service]);

  useEffect(() => {
    if (categoryIds.length > 0 && pspTypes.length > 0) {
      const labels = categoryIds
        .map((id) => pspTypes.find((pt) => pt.id === id)?.label)
        .filter((l): l is string => !!l);
      setSelectedCategoryLabels(labels);
    } else if (service?.category && pspTypes.length > 0) {
      const match = pspTypes.find((pt) => pt.label === service.category);
      if (match) setSelectedCategoryLabels([match.label]);
    }
  }, [categoryIds, service?.category, pspTypes]);

  const openAddPackage = () => {
    if (packages.length >= 3) {
      toast.error("Maximum 3 packages allowed");
      return;
    }
    setEditingPackage(null);
    setPackageForm({ title: "", description: "", price: 0, delivery_days: 3 });
    setPackageDialogOpen(true);
  };

  const openEditPackage = (pkg: ServicePackageRow) => {
    setEditingPackage(pkg);
    setPackageForm({
      title: pkg.title,
      description: pkg.description ?? "",
      price: pkg.price,
      delivery_days: pkg.delivery_days,
    });
    setPackageDialogOpen(true);
  };

  const handlePackageSubmit = async () => {
    if (!packageForm.title.trim()) {
      toast.error("Package title is required");
      return;
    }
    const price = Number(packageForm.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a non-negative number");
      return;
    }
    const deliveryDays = Number(packageForm.delivery_days);
    if (Number.isNaN(deliveryDays) || deliveryDays < 0) {
      toast.error("Delivery days must be a non-negative number");
      return;
    }

    try {
      if (editingPackage) {
        await updatePackage.mutateAsync({
          id: editingPackage.id,
          title: packageForm.title.trim(),
          description: packageForm.description.trim() || null,
          price,
          delivery_days: deliveryDays,
        });
      } else {
        await createPackage.mutateAsync({
          title: packageForm.title.trim(),
          description: packageForm.description.trim() || null,
          price,
          delivery_days: deliveryDays,
          sort_order: packages.length,
        });
      }
      setPackageDialogOpen(false);
    } catch {
      // Toast handled by hooks
    }
  };

  const handleDeletePackageConfirm = async () => {
    if (!deletePackageId) return;
    try {
      await deletePackage.mutateAsync(deletePackageId);
      setDeletePackageId(null);
    } catch {
      // Toast handled by hooks
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !service || !providerId) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (selectedCategoryLabels.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a non-negative number");
      return;
    }
    const deliveryDays = form.delivery_days != null ? form.delivery_days : null;
    if (
      deliveryDays != null &&
      (Number.isNaN(deliveryDays) || deliveryDays < 0)
    ) {
      toast.error("Delivery days must be a non-negative number");
      return;
    }

    try {
      await updateService.mutateAsync({
        id: serviceId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        price,
        image_url: form.image_url?.trim() || null,
        delivery_days: deliveryDays,
      });
      const categoryIdsToSave = selectedCategoryLabels
        .map((label) => pspTypes.find((pt) => pt.label === label)?.id)
        .filter((id): id is string => !!id);
      await updateServiceCategories(serviceId, categoryIdsToSave, providerId);
      queryClient.invalidateQueries({
        queryKey: ["service_categories", serviceId],
      });
    } catch {
      // Toast handled by hooks
    }
  };

  const handleDeleteService = async () => {
    if (!serviceId) return;
    try {
      await deleteService.mutateAsync(serviceId);
      router.push("/dashboard/services");
    } catch {
      // Toast handled by hooks
    }
  };

  if (serviceId && !service && !serviceLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Service not found</p>
          <Link href="/dashboard/services">
            <Button variant="outline">Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
            <div className="mb-8">
              <Link
                href="/dashboard/services"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
              <p className="text-gray-600 mt-1">
                Update service details and manage pricing packages.
              </p>
            </div>

            <div className="space-y-8 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="service-title">Title *</Label>
                      <Input
                        id="service-title"
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="e.g. Full Home Inspection"
                      />
                    </div>
                    <div className="grid gap-2">
                      <PSPMultiSelect
                        label="Categories *"
                        placeholder="Ex. Architect, Agent, Builder..."
                        optionsByLetter={PSP_OPTIONS_BY_LETTER}
                        value={selectedCategoryLabels}
                        onChange={(v) => setSelectedCategoryLabels(v)}
                        agentOptions={agentOptions}
                        realEstateOptions={realEstateOptions}
                        crowdfundingOptions={crowdfundingOptions}
                        flooringIndoorOptions={flooringIndoorOptions}
                        flooringOutdoorOptions={flooringOutdoorOptions}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="service-description">Description</Label>
                      <Textarea
                        id="service-description"
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your service..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="service-price">Base Price ($)</Label>
                        <Input
                          id="service-price"
                          type="number"
                          min={0}
                          step={0.01}
                          value={form.price === 0 ? "" : form.price}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              price:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="service-delivery">
                          Delivery (days)
                        </Label>
                        <Input
                          id="service-delivery"
                          type="number"
                          min={0}
                          value={form.delivery_days ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => ({
                              ...f,
                              delivery_days: v === "" ? null : Number(v),
                            }));
                          }}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="service-image">
                        Image URL (optional)
                      </Label>
                      <Input
                        id="service-image"
                        value={form.image_url ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, image_url: e.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={updateService.isPending}>
                        {updateService.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteService}
                        disabled={deleteService.isPending}
                      >
                        {deleteService.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delete Service"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Packages</CardTitle>
                    <Button
                      onClick={openAddPackage}
                      size="sm"
                      disabled={packages.length >= 3}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Package
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create pricing tiers (e.g. Basic, Standard, Premium) for
                    this service. Max 3 packages.
                  </p>
                </CardHeader>
                <CardContent>
                  {packagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : packages.length === 0 ? (
                    <p className="text-muted-foreground py-6">
                      No packages yet. Add one to offer different pricing
                      options.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Package</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Delivery</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packages.map((pkg) => (
                          <TableRow key={pkg.id}>
                            <TableCell className="font-medium">
                              {pkg.title}
                            </TableCell>
                            <TableCell className="text-right">
                              ${Number(pkg.price).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {pkg.delivery_days} days
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditPackage(pkg)}
                                  aria-label="Edit package"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletePackageId(pkg.id)}
                                  aria-label="Delete package"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
      </div>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Add Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="package-title">Title *</Label>
              <Input
                id="package-title"
                value={packageForm.title}
                onChange={(e) =>
                  setPackageForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Basic, Standard, Premium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="package-description">Description</Label>
              <Textarea
                id="package-description"
                value={packageForm.description}
                onChange={(e) =>
                  setPackageForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What's included in this package..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="package-price">Price ($)</Label>
                <Input
                  id="package-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={packageForm.price === 0 ? "" : packageForm.price}
                  onChange={(e) =>
                    setPackageForm((f) => ({
                      ...f,
                      price: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="package-delivery">Delivery (days)</Label>
                <Input
                  id="package-delivery"
                  type="number"
                  min={0}
                  value={packageForm.delivery_days}
                  onChange={(e) =>
                    setPackageForm((f) => ({
                      ...f,
                      delivery_days: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPackageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePackageSubmit}
              disabled={createPackage.isPending || updatePackage.isPending}
            >
              {(createPackage.isPending || updatePackage.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPackage ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletePackageId}
        onOpenChange={(open) => !open && setDeletePackageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete package?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeletePackageConfirm}
              disabled={deletePackage.isPending}
            >
              {deletePackage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
