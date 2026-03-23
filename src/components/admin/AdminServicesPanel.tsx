import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { slugifyFromName } from "@/lib/slugify";
import { SERVICE_LUCIDE_ICON_NAMES, isIconImageUrl } from "@/lib/serviceIcons";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { ServiceCustomField } from "@/lib/serviceCustomFields";
import { normalizeCustomFields } from "@/lib/serviceCustomFields";
import { ServiceCustomFieldsBuilder } from "@/components/admin/ServiceCustomFieldsBuilder";

const SERVICE_CATEGORIES = ["Printing", "Binding", "Manuals", "Other"] as const;

type ServiceRow = Tables<"services">;

async function isSlugTaken(slug: string, excludeId?: string) {
  let q = supabase.from("services").select("id").eq("slug", slug).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function uploadServiceIcon(file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from("service-icons").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("service-icons").getPublicUrl(path);
  return data.publicUrl;
}

type IconMode = "lucide" | "image";

type AdminServicesPanelProps = { mode: "create" | "manage" };

export function AdminServicesPanel({ mode }: AdminServicesPanelProps) {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [iconMode, setIconMode] = useState<IconMode>("lucide");
  const [lucideIcon, setLucideIcon] = useState<string>("FileText");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [customFields, setCustomFields] = useState<ServiceCustomField[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [editSlugTouched, setEditSlugTouched] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIconMode, setEditIconMode] = useState<IconMode>("lucide");
  const [editLucideIcon, setEditLucideIcon] = useState("FileText");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editCategory, setEditCategory] = useState(SERVICE_CATEGORIES[0]);
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState(true);
  const [editDisplayOrder, setEditDisplayOrder] = useState("0");
  const [editCustomFields, setEditCustomFields] = useState<ServiceCustomField[]>([]);

  const invalidateServices = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const resetCreateForm = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setIconMode("lucide");
    setLucideIcon("FileText");
    setImageFile(null);
    setCategory(SERVICE_CATEGORIES[0]);
    setPrice("");
    setStatus(true);
    setDisplayOrder("0");
    setCustomFields([]);
  };

  const onNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugifyFromName(v));
  };

  const openEdit = (row: ServiceRow) => {
    setEditing(row);
    setEditName(row.name);
    setEditSlug(row.slug);
    setEditSlugTouched(true);
    setEditDescription(row.description ?? "");
    const img = isIconImageUrl(row.icon);
    setEditIconMode(img ? "image" : "lucide");
    setEditLucideIcon(img ? "FileText" : row.icon || "FileText");
    setEditImageFile(null);
    const cat = row.category ?? "";
    setEditCategory((SERVICE_CATEGORIES as readonly string[]).includes(cat) ? cat : SERVICE_CATEGORIES[0]);
    setEditPrice(row.price != null ? String(row.price) : "");
    setEditStatus(row.status !== false);
    setEditDisplayOrder(String(row.display_order ?? 0));
    setEditCustomFields(normalizeCustomFields(row.custom_fields));
    setEditOpen(true);
  };

  const onEditNameChange = (v: string) => {
    setEditName(v);
    if (!editSlugTouched) setEditSlug(slugifyFromName(v));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (!trimmedSlug) {
      toast({ title: "Slug required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (await isSlugTaken(trimmedSlug)) {
        toast({ title: "Slug already in use", description: "Choose a different URL path.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      let iconValue: string | null = lucideIcon;
      if (iconMode === "image") {
        if (!imageFile) {
          toast({ title: "Select an image", description: "Or switch to Lucide icon.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        iconValue = await uploadServiceIcon(imageFile);
      }
      const { error } = await supabase.from("services").insert({
        name: trimmedName,
        slug: trimmedSlug,
        description: description.trim() || null,
        icon: iconValue,
        category,
        price: price.trim() === "" ? null : Number(price),
        status,
        display_order: Number(displayOrder) || 0,
        custom_fields: customFields as any,
      });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Slug already in use", variant: "destructive" });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setSubmitting(false);
        return;
      }
      toast({ title: "Service created" });
      resetCreateForm();
      invalidateServices();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const trimmedName = editName.trim();
    const trimmedSlug = editSlug.trim();
    if (!trimmedName || !trimmedSlug) {
      toast({ title: "Name and slug required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (await isSlugTaken(trimmedSlug, editing.id)) {
        toast({ title: "Slug already in use", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      let iconValue: string | null = editing.icon;
      if (editIconMode === "lucide") {
        iconValue = editLucideIcon;
      } else if (editImageFile) {
        iconValue = await uploadServiceIcon(editImageFile);
      } else if (!isIconImageUrl(editing.icon)) {
        toast({ title: "Upload an image or switch to Lucide icon", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await supabase
        .from("services")
        .update({
          name: trimmedName,
          slug: trimmedSlug,
          description: editDescription.trim() || null,
          icon: iconValue,
          category: editCategory,
          price: editPrice.trim() === "" ? null : Number(editPrice),
          status: editStatus,
          display_order: Number(editDisplayOrder) || 0,
          custom_fields: editCustomFields as any,
        })
        .eq("id", editing.id);
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Slug already in use", variant: "destructive" });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setSubmitting(false);
        return;
      }
      toast({ title: "Service updated" });
      setEditOpen(false);
      setEditing(null);
      invalidateServices();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const deleteService = async (row: ServiceRow) => {
    if (!confirm(`Delete “${row.name}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("services").delete().eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Service deleted" });
      invalidateServices();
    }
  };

  const toggleStatus = async (row: ServiceRow, next: boolean) => {
    const { error } = await supabase.from("services").update({ status: next }).eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: next ? "Service activated" : "Service deactivated" });
      invalidateServices();
    }
  };

  if (mode === "create") {
    return (
      <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
        <CardHeader>
          <CardTitle>Create Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-5 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="svc-name">Service name *</Label>
              <Input
                id="svc-name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Paper Projects"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-slug">Slug / URL path *</Label>
              <Input
                id="svc-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="paper-projects"
                required
              />
              <p className="text-xs text-muted-foreground">Auto-filled from name; edit anytime. Used in /order/your-slug</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Description</Label>
              <Textarea id="svc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-2">
                <Button type="button" variant={iconMode === "lucide" ? "default" : "outline"} size="sm" onClick={() => setIconMode("lucide")}>
                  Lucide icon
                </Button>
                <Button type="button" variant={iconMode === "image" ? "default" : "outline"} size="sm" onClick={() => setIconMode("image")}>
                  Image upload
                </Button>
              </div>
              {iconMode === "lucide" ? (
                <Select value={lucideIcon} onValueChange={setLucideIcon}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_LUCIDE_ICON_NAMES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="max-w-xs">
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
            <div className="space-y-2">
              <Label htmlFor="svc-price">Price (optional)</Label>
              <Input id="svc-price" type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave empty" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-primary/10 p-3">
              <div>
                <Label htmlFor="svc-status">Status</Label>
                <p className="text-xs text-muted-foreground">{status ? "Active (visible on site)" : "Inactive (hidden)"}</p>
              </div>
              <Switch id="svc-status" checked={status} onCheckedChange={setStatus} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-order">Display order</Label>
              <Input id="svc-order" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
            </div>
            <ServiceCustomFieldsBuilder value={customFields} onChange={setCustomFields} />
            <Button type="submit" disabled={submitting} className="min-w-[140px]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Service"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
        <CardHeader>
          <CardTitle>Manage services</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !services?.length ? (
            <p className="p-8 text-center text-muted-foreground">No services yet. Create one from Create Service.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                      <TableCell>{row.category ?? "—"}</TableCell>
                      <TableCell>{row.display_order ?? 0}</TableCell>
                      <TableCell>
                        <Switch checked={row.status !== false} onCheckedChange={(v) => toggleStatus(row, v)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteService(row)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Service name *</Label>
                <Input value={editName} onChange={(e) => onEditNameChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={editSlug}
                  onChange={(e) => {
                    setEditSlugTouched(true);
                    setEditSlug(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={editIconMode === "lucide" ? "default" : "outline"} size="sm" onClick={() => setEditIconMode("lucide")}>
                    Lucide
                  </Button>
                  <Button type="button" variant={editIconMode === "image" ? "default" : "outline"} size="sm" onClick={() => setEditIconMode("image")}>
                    Image
                  </Button>
                </div>
                {editIconMode === "lucide" ? (
                  <Select value={editLucideIcon} onValueChange={setEditLucideIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_LUCIDE_ICON_NAMES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    {isIconImageUrl(editing.icon) && !editImageFile && (
                      <p className="text-xs text-muted-foreground break-all">Current: {editing.icon}</p>
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Price (optional)</Label>
                <Input type="number" step="0.01" min={0} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Visible on homepage when on</p>
                </div>
                <Switch checked={editStatus} onCheckedChange={setEditStatus} />
              </div>
              <div className="space-y-2">
                <Label>Display order</Label>
                <Input type="number" value={editDisplayOrder} onChange={(e) => setEditDisplayOrder(e.target.value)} />
              </div>
              <ServiceCustomFieldsBuilder value={editCustomFields} onChange={setEditCustomFields} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
