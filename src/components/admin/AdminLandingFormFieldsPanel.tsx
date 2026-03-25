import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { LANDING_FORM_CATEGORY_GRAPHIC, LANDING_FORM_CATEGORY_PAPER } from "@/lib/serviceCategories";
import { toSnakeCase } from "@/lib/serviceCustomFields";

type FieldRow = Tables<"landing_form_fields">;
type SubmissionRow = Tables<"paper_project_submissions">;

const FIELD_TYPES = ["text", "textarea", "file", "select"] as const;

function optionsToText(opts: unknown): string {
  if (!Array.isArray(opts)) return "";
  return opts.filter((x): x is string => typeof x === "string").join("\n");
}

function textToOptions(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminLandingFormFieldsPanel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>(LANDING_FORM_CATEGORY_PAPER);

  const { data: fields, isLoading } = useQuery({
    queryKey: ["admin-landing-form-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_form_fields")
        .select("*")
        .order("category")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FieldRow[];
    },
  });

  const { data: submissions, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-paper-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paper_project_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as SubmissionRow[];
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FieldRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [label, setLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [fieldType, setFieldType] = useState<(typeof FIELD_TYPES)[number]>("text");
  const [optionsText, setOptionsText] = useState("");
  const [required, setRequired] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [active, setActive] = useState(true);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-landing-form-fields"] });
    queryClient.invalidateQueries({ queryKey: ["landing-form-fields"] });
  };

  const openCreate = () => {
    setEditing(null);
    setLabel("");
    setFieldKey("");
    setKeyTouched(false);
    setFieldType("text");
    setOptionsText("");
    setRequired(false);
    setDisplayOrder("0");
    setActive(true);
    setDialogOpen(true);
  };

  const openEdit = (row: FieldRow) => {
    setEditing(row);
    setTab(row.category);
    setLabel(row.label);
    setFieldKey(row.field_key);
    setKeyTouched(true);
    setFieldType(row.field_type as (typeof FIELD_TYPES)[number]);
    setOptionsText(optionsToText(row.options));
    setRequired(row.required);
    setDisplayOrder(String(row.display_order ?? 0));
    setActive(row.active);
    setDialogOpen(true);
  };

  const onLabelChange = (v: string) => {
    setLabel(v);
    if (!keyTouched && !editing) setFieldKey(toSnakeCase(v));
  };

  const saveField = async () => {
    const cat = (editing?.category ??
      tab) as typeof LANDING_FORM_CATEGORY_PAPER | typeof LANDING_FORM_CATEGORY_GRAPHIC;
    const trimmedLabel = label.trim();
    const trimmedKey = fieldKey.trim();
    if (!trimmedLabel || !trimmedKey) {
      toast({ title: "Label and field key required", variant: "destructive" });
      return;
    }
    if (fieldType === "select" && !textToOptions(optionsText).length) {
      toast({ title: "Add at least one option for select fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category: cat,
        field_key: trimmedKey,
        label: trimmedLabel,
        field_type: fieldType,
        options: textToOptions(optionsText) as unknown as FieldRow["options"],
        required,
        display_order: Number(displayOrder) || 0,
        active,
      };

      if (editing) {
        const { error } = await supabase.from("landing_form_fields").update(payload).eq("id", editing.id);
        if (error) {
          if (error.code === "23505") {
            toast({ title: "Field key already exists for this category", variant: "destructive" });
            setSubmitting(false);
            return;
          }
          throw error;
        }
        toast({ title: "Field updated" });
      } else {
        const { error } = await supabase.from("landing_form_fields").insert(payload);
        if (error) {
          if (error.code === "23505") {
            toast({ title: "Field key already exists for this category", variant: "destructive" });
            setSubmitting(false);
            return;
          }
          throw error;
        }
        toast({ title: "Field created" });
      }
      setDialogOpen(false);
      invalidate();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to save",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const deleteField = async (row: FieldRow) => {
    if (!confirm(`Delete field “${row.label}”?`)) return;
    const { error } = await supabase.from("landing_form_fields").delete().eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Field deleted" });
      invalidate();
    }
  };

  const deleteSubmission = async (row: SubmissionRow) => {
    if (!confirm("Delete this submission?")) return;
    const { error } = await supabase.from("paper_project_submissions").delete().eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Submission deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-paper-submissions"] });
    }
  };

  const filteredFields = (fields ?? []).filter((f) => f.category === tab);

  return (
    <div className="space-y-8">
      <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Landing form fields</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Paper projects uses these fields on <span className="font-mono">/paper-project</span>. Graphic design fields appear on the graphic design contact form.
            </p>
          </div>
          <Button type="button" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add field
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value={LANDING_FORM_CATEGORY_PAPER}>Paper projects</TabsTrigger>
              <TabsTrigger value={LANDING_FORM_CATEGORY_GRAPHIC}>Graphic design</TabsTrigger>
            </TabsList>

            <TabsContent value={LANDING_FORM_CATEGORY_PAPER} className="mt-0">
              {renderTable()}
            </TabsContent>
            <TabsContent value={LANDING_FORM_CATEGORY_GRAPHIC} className="mt-0">
              {renderTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {tab === LANDING_FORM_CATEGORY_PAPER && (
        <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
          <CardHeader>
            <CardTitle>Paper project submissions</CardTitle>
            <p className="text-sm text-muted-foreground">Latest requests from the paper project form.</p>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {subsLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !submissions?.length ? (
              <p className="p-8 text-center text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="overflow-x-auto px-4 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name}</TableCell>
                        <TableCell className="text-sm">{s.phone ?? "—"}</TableCell>
                        <TableCell className="text-sm">{s.email ?? "—"}</TableCell>
                        <TableCell className="text-xs max-w-md">
                          <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                            {JSON.stringify(s.responses, null, 2)}
                          </pre>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSubmission(s)}>
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit field" : "New field"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Category: <strong>{tab === LANDING_FORM_CATEGORY_PAPER ? "Paper projects" : "Graphic design"}</strong>
            </p>
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="e.g. Project title" />
            </div>
            <div className="space-y-2">
              <Label>Field key *</Label>
              <Input
                value={fieldKey}
                onChange={(e) => {
                  setKeyTouched(true);
                  setFieldKey(e.target.value);
                }}
                placeholder="project_title"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Stable id for storage; use lowercase and underscores.</p>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={fieldType} onValueChange={(v) => setFieldType(v as (typeof FIELD_TYPES)[number])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fieldType === "select" && (
              <div className="space-y-2">
                <Label>Options (one per line)</Label>
                <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} rows={4} placeholder="Option A&#10;Option B" />
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Required</Label>
              </div>
              <Switch checked={required} onCheckedChange={setRequired} />
            </div>
            <div className="space-y-2">
              <Label>Display order</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Inactive fields are hidden on the public form.</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveField} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderTable() {
    if (isLoading) {
      return (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (!filteredFields.length) {
      return <p className="text-muted-foreground py-8 text-center">No fields yet. Add one to collect input on the public page.</p>;
    }
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFields.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className="font-mono text-xs">{row.field_key}</TableCell>
                <TableCell>{row.field_type}</TableCell>
                <TableCell>{row.display_order}</TableCell>
                <TableCell>{row.active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteField(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
