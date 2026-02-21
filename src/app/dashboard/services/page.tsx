"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";
import { useServicesCrud, type ServiceRow } from "@/hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type UserType = "service_provider" | "agent";

export default function ServicesPage() {
  const { user } = useAuth();
  const { data: profileData } = useProfile(user?.id ?? null);
  const profile = profileData ?? null;
  const userType: UserType = profile?.user_roles?.length
    ? "service_provider"
    : "agent";
  const providerId = user?.id ?? null;
  const { services, servicesLoading, deleteService } =
    useServicesCrud(providerId);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteService.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Toast handled by hooks
    }
  };

  const pageTitle =
    userType === "service_provider" ? "My Services" : "Bought Services";
  const pageDescription =
    userType === "service_provider"
      ? "Create and manage your service offerings."
      : "Services you've purchased will appear here.";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              {userType === "service_provider" && (
                <Button asChild>
                  <Link href="/dashboard/services/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Link>
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
                                    asChild
                                    aria-label="Edit service"
                                  >
                                    <Link href={`/dashboard/services/${row.id}/edit`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
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
    </div>
  );
}
