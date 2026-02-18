"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";
import {
  useServicesCrud,
  type ServiceRow,
  type ServiceInsert,
} from "@/hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "General",
  "Property Inspection",
  "Real Estate",
  "Mortgage",
  "Trade",
  "Legal",
  "Contractor",
  "Other",
];

type UserType = "service_provider" | "agent";

const defaultFormState = (): Omit<ServiceInsert, "provider_id"> => ({
  title: "",
  category: "General",
  description: "",
  price: 0,
  image_url: "",
  delivery_days: null,
});

export default function ServicesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: profileData } = useProfile(user?.id ?? null);
  const profile = profileData ?? null;
  const userType: UserType = profile?.user_roles?.length
    ? "service_provider"
    : "agent";
  const providerId = user?.id ?? null;
  const {
    services,
    servicesLoading,
    createService,
    updateService,
    deleteService,
  } = useServicesCrud(providerId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState(defaultFormState());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const openAdd = () => {
    setEditingService(null);
    setForm(defaultFormState());
    setDialogOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditingService(row);
    setForm({
      title: row.title,
      category: row.category,
      description: row.description ?? "",
      price: row.price,
      image_url: row.image_url ?? "",
      delivery_days: row.delivery_days,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
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
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim() || null,
          price,
          image_url: form.image_url?.trim() || null,
          delivery_days: deliveryDays,
        });
      } else {
        await createService.mutateAsync({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim() || null,
          price,
          image_url: form.image_url?.trim() || null,
          delivery_days: deliveryDays,
        });
      }
      setDialogOpen(false);
    } catch {
      // Toast handled by hooks
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteService.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Toast handled by hooks
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pageTitle =
    userType === "service_provider" ? "My Services" : "Bought Services";
  const pageDescription =
    userType === "service_provider"
      ? "Create and manage your service offerings."
      : "Services you've purchased will appear here.";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full">
        <FreeioDashboardHeader
          user={user ?? undefined}
          profile={profile}
          userType={userType}
        />
        <div className="flex flex-1">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              {userType === "service_provider" && (
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{pageTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{pageDescription}</p>
                {userType === "service_provider" && (
                  <>
                    {servicesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : services.length === 0 ? (
                      <p className="text-muted-foreground py-6">
                        You haven&apos;t added any services yet. Click &quot;Add
                        Service&quot; to create one.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[56px]"></TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">
                              Delivery (days)
                            </TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="w-[56px]">
                                <Avatar className="h-12 w-12 rounded">
                                  <AvatarImage
                                    src={row.image_url ?? undefined}
                                    alt={row.title}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="rounded bg-muted text-muted-foreground text-xs">
                                    {row.title.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">
                                {row.title}
                              </TableCell>
                              <TableCell>{row.category}</TableCell>
                              <TableCell className="text-right">
                                {typeof row.price === "number"
                                  ? `$${Number(row.price).toFixed(2)}`
                                  : row.price}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.delivery_days != null
                                  ? row.delivery_days
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(row)}
                                    aria-label="Edit service"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(row.id)}
                                    aria-label="Delete service"
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
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        <FreeioFooter />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="service-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="service-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your service..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="service-price">Price ($)</Label>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-delivery">Delivery (days)</Label>
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
              <Label htmlFor="service-image">Image URL (optional)</Label>
              <Input
                id="service-image"
                value={form.image_url ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createService.isPending || updateService.isPending}
            >
              {(createService.isPending || updateService.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingService ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The service will be removed from
              your list and from search.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDeleteConfirm();
              }}
              disabled={deleteService.isPending}
            >
              {deleteService.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
