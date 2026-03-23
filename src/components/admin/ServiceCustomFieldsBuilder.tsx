import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCustomFieldsForm } from "@/components/dynamic/ServiceCustomFieldsForm";
import type { ServiceCustomField, ServiceCustomFieldType } from "@/lib/serviceCustomFields";
import { toSnakeCase } from "@/lib/serviceCustomFields";
import { PlusCircle, GripVertical, Trash2 } from "lucide-react";

type DraftField = ServiceCustomField & {
  _id: string;
  _nameLocked: boolean;
  _optionsText: string;
  _acceptText: string;
  _maxFileMbText: string;
};

const FIELD_TYPES: { value: ServiceCustomFieldType; label: string }[] = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number Input" },
  { value: "dropdown", label: "Dropdown (Select)" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File Upload" },
];

function toLineArray(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseAcceptText(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function bytesFromMb(mbText: string): number | undefined {
  const mb = Number(mbText);
  if (!Number.isFinite(mb) || mb <= 0) return undefined;
  return Math.floor(mb * 1024 * 1024);
}

export function ServiceCustomFieldsBuilder({
  value,
  onChange,
}: {
  value: ServiceCustomField[];
  onChange: (next: ServiceCustomField[]) => void;
}) {
  const [fields, setFields] = useState<DraftField[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewFiles, setPreviewFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    setFields(
      (value ?? []).map((f) => {
        const id = crypto.randomUUID();
        const optionsText = (f.options ?? []).join("\n");
        const acceptText = (f.accept ?? []).join(", ");
        const maxFileMbText =
          typeof f.max_file_size_bytes === "number" && f.max_file_size_bytes > 0
            ? String(Math.max(1, Math.round(f.max_file_size_bytes / (1024 * 1024))))
            : "10";
        return {
          ...f,
          _id: id,
          _nameLocked: true,
          _optionsText: optionsText,
          _acceptText: acceptText,
          _maxFileMbText: maxFileMbText,
        };
      }),
    );
  }, [value]);

  const cleanedFields = useMemo<ServiceCustomField[]>(() => {
    return fields
      .map((f) => {
        const base: ServiceCustomField = {
          label: f.label.trim(),
          name: f.name.trim(),
          type: f.type,
          required: !!f.required,
        };

        if (f.type === "dropdown" || f.type === "radio") {
          base.options = toLineArray(f._optionsText);
        }

        if (f.type === "file") {
          base.accept = parseAcceptText(f._acceptText);
          const bytes = bytesFromMb(f._maxFileMbText);
          if (bytes) base.max_file_size_bytes = bytes;
        }

        return base;
      })
      .filter((f) => f.label && f.name);
  }, [fields]);

  useEffect(() => {
    onChange(cleanedFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanedFields]);

  useEffect(() => {
    setPreviewValues({});
    setPreviewFiles({});
  }, [value]);

  const addField = () => {
    const defaultLabel = "New Field";
    const name = toSnakeCase(defaultLabel) || "new_field";
    const id = crypto.randomUUID();
    setFields((prev) => [
      ...prev,
      {
        _id: id,
        _nameLocked: false,
        label: defaultLabel,
        name,
        type: "text",
        required: false,
        options: [],
        accept: [],
        max_file_size_bytes: undefined,
        _optionsText: "",
        _acceptText: ".pdf,.docx,image/*",
        _maxFileMbText: "10",
      },
    ]);
  };

  const moveField = (from: number, to: number) => {
    setFields((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const validateBeforeDelete = (fieldName: string) => {
    // soft validation placeholder to keep UX consistent
    if (!fieldName) return true;
    return true;
  };

  const removeField = (idx: number) => {
    const name = fields[idx]?.name;
    if (!validateBeforeDelete(name)) return;
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Custom Fields Builder</p>
          <p className="text-xs text-muted-foreground">Drag to reorder. Delete to remove. Order page renders automatically from this schema.</p>
        </div>
        <Button type="button" variant="outline" onClick={addField} className="shrink-0">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-background border border-primary/10 rounded-lg p-4">
          No custom fields yet. Click <span className="font-medium">Add Field</span> to start building a dynamic order form.
        </p>
      ) : (
        <div className="space-y-4">
          {fields.map((f, idx) => (
            <Card
              key={f._id}
              className={`border-primary/10 bg-gradient-to-br from-white/95 to-primary/5 ${dragFrom === idx ? "opacity-70" : ""}`}
              draggable={false}
              onDragOver={onDragOver}
              onDrop={() => {
                if (dragFrom === null) return;
                if (dragFrom === idx) return;
                moveField(dragFrom, idx);
                setDragFrom(null);
              }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-grab active:cursor-grabbing text-muted-foreground"
                      draggable
                      onDragStart={() => setDragFrom(idx)}
                      onDragEnd={() => setDragFrom(null)}
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Field {idx + 1}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeField(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Field Label</Label>
                    <Input
                      value={f.label}
                      onChange={(e) => {
                        const nextLabel = e.target.value;
                        setFields((prev) =>
                          prev.map((x) =>
                            x._id !== f._id
                              ? x
                              : {
                                  ...x,
                                  label: nextLabel,
                                  ...(x._nameLocked ? {} : { name: toSnakeCase(nextLabel) || x.name }),
                                },
                          ),
                        );
                      }}
                      placeholder="e.g. Number of Pages"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Field Name (key)</Label>
                    <Input
                      value={f.name}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setFields((prev) => prev.map((x) => (x._id !== f._id ? x : { ...x, name: nextName, _nameLocked: true })));
                      }}
                      placeholder="e.g. num_pages"
                    />
                    <p className="text-[11px] text-muted-foreground">Used as the property key for the order form values.</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Field Type</Label>
                    <Select
                      value={f.type}
                      onValueChange={(v) => {
                        setFields((prev) =>
                          prev.map((x) =>
                            x._id !== f._id
                              ? x
                              : {
                                  ...x,
                                  type: v as ServiceCustomFieldType,
                                  // keep existing text inputs to reduce user friction
                                },
                          ),
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-primary/10 p-3">
                    <div>
                      <Label className="text-sm font-medium">Required</Label>
                      <p className="text-xs text-muted-foreground">Admin must fill this before placing an order.</p>
                    </div>
                    <Switch
                      checked={f.required}
                      onCheckedChange={(v) => setFields((prev) => prev.map((x) => (x._id !== f._id ? x : { ...x, required: !!v })))}
                    />
                  </div>
                </div>

                {(f.type === "dropdown" || f.type === "radio") && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Options</Label>
                    <Textarea
                      value={f._optionsText}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFields((prev) => prev.map((x) => (x._id !== f._id ? x : { ...x, _optionsText: v })));
                      }}
                      rows={3}
                      placeholder={`One option per line\nBlack & White\nColor`}
                    />
                    <p className="text-xs text-muted-foreground">Dropdown/Radio options are split by lines.</p>
                  </div>
                )}

                {f.type === "file" && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Accept</Label>
                        <Input
                          value={f._acceptText}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFields((prev) => prev.map((x) => (x._id !== f._id ? x : { ...x, _acceptText: v })));
                          }}
                          placeholder=".pdf,.docx,image/*"
                        />
                        <p className="text-xs text-muted-foreground">Comma-separated. Example: `.pdf,.docx,image/*`</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Max file size (MB)</Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={f._maxFileMbText}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFields((prev) => prev.map((x) => (x._id !== f._id ? x : { ...x, _maxFileMbText: v })));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceCustomFieldsForm
            fields={cleanedFields}
            values={previewValues}
            fileValues={previewFiles}
            onChangeValue={(name, val) => setPreviewValues((p) => ({ ...p, [name]: val }))}
            onChangeFile={(name, file) => setPreviewFiles((p) => ({ ...p, [name]: file }))}
            errors={{}}
          />
          {cleanedFields.length === 0 && (
            <p className="text-sm text-muted-foreground">Your preview will appear here once you add fields.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

