import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { ServiceCustomField } from "@/lib/serviceCustomFields";
import { isFileType } from "@/lib/serviceCustomFields";
import { FileText } from "lucide-react";

type Props = {
  fields: ServiceCustomField[];
  values: Record<string, any>;
  fileValues: Record<string, File | null | undefined>;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  onChangeValue: (name: string, value: any) => void;
  onChangeFile: (name: string, file: File | null) => void;
};

function FilePreview({ file }: { file: File | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file) return null;

  const mb = file.size / (1024 * 1024);
  const sizeLabel = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-background p-3">
      {url ? (
        <img src={url} alt="" className="h-10 w-10 rounded object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <FileText className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{sizeLabel}</p>
      </div>
    </div>
  );
}

export function ServiceCustomFieldsForm({
  fields,
  values,
  fileValues,
  errors,
  disabled,
  onChangeValue,
  onChangeFile,
}: Props) {
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const err = errors?.[field.name];
        const requiredMark = field.required ? <span className="text-destructive">*</span> : null;

        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={`custom-${field.name}`} className="text-sm font-medium text-foreground">
                {field.label} {requiredMark}
              </Label>
            </div>

            {field.type === "text" && (
              <Input
                id={`custom-${field.name}`}
                disabled={disabled}
                value={typeof values[field.name] === "string" ? values[field.name] : ""}
                placeholder={field.label}
                onChange={(e) => onChangeValue(field.name, e.target.value)}
              />
            )}

            {field.type === "number" && (
              <Input
                id={`custom-${field.name}`}
                disabled={disabled}
                type="number"
                min={0}
                step="1"
                value={typeof values[field.name] === "number" ? values[field.name] : ""}
                placeholder={field.label}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return onChangeValue(field.name, null);
                  const n = Number(v);
                  onChangeValue(field.name, Number.isFinite(n) ? n : null);
                }}
              />
            )}

            {field.type === "dropdown" && (
              <Select
                disabled={disabled}
                value={typeof values[field.name] === "string" ? values[field.name] : ""}
                onValueChange={(v) => onChangeValue(field.name, v)}
              >
                <SelectTrigger id={`custom-${field.name}`} className="max-w-xl">
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "radio" && (
              <RadioGroup
                disabled={disabled}
                value={typeof values[field.name] === "string" ? values[field.name] : ""}
                onValueChange={(v) => onChangeValue(field.name, v)}
                className="space-y-2"
              >
                {(field.options ?? []).map((opt) => (
                  <div key={opt} className="flex items-center gap-3">
                    <RadioGroupItem value={opt} id={`custom-${field.name}-${opt}`} />
                    <Label htmlFor={`custom-${field.name}-${opt}`} className="text-sm font-medium text-foreground">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`custom-${field.name}`}
                  checked={!!values[field.name]}
                  disabled={disabled}
                  onCheckedChange={(c) => onChangeValue(field.name, !!c)}
                />
                <Label htmlFor={`custom-${field.name}`} className="text-sm font-medium text-foreground">
                  {field.label}
                </Label>
              </div>
            )}

            {isFileType(field) && (
              <div className="space-y-3">
                <Input
                  id={`custom-${field.name}`}
                  disabled={disabled}
                  type="file"
                  accept={(field.accept ?? []).join(",")}
                  onChange={(e) => onChangeFile(field.name, e.target.files?.[0] ?? null)}
                />
                <FilePreview file={fileValues[field.name] ?? null} />
              </div>
            )}

            {field.type !== "checkbox" && err && <p className="text-sm text-destructive">{err}</p>}
            {field.type === "checkbox" && err && <p className="text-sm text-destructive mt-2">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}

