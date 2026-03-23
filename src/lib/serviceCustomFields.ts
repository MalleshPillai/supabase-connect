import type { Json } from "@/integrations/supabase/types";

export type ServiceCustomFieldType = "text" | "number" | "dropdown" | "radio" | "checkbox" | "file";

export type ServiceCustomField = {
  label: string;
  name: string; // key used as object property and in /order/[slug] renderer
  type: ServiceCustomFieldType;
  required: boolean;
  options?: string[];
  accept?: string[]; // e.g. [".pdf", ".docx", "image/*"]
  max_file_size_bytes?: number;
};

export type ServiceCustomFieldJson = Json;

export function toSnakeCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export function normalizeCustomFields(input: unknown): ServiceCustomField[] {
  if (!Array.isArray(input)) return [];

  const allowedTypes: ServiceCustomFieldType[] = ["text", "number", "dropdown", "radio", "checkbox", "file"];

  return input
    .map((raw: any) => {
      const label = typeof raw?.label === "string" ? raw.label.trim() : "";
      const name = typeof raw?.name === "string" ? raw.name.trim() : "";
      const type = raw?.type as ServiceCustomFieldType;
      const required = !!raw?.required;

      if (!label || !name || !allowedTypes.includes(type)) return null;

      const field: ServiceCustomField = {
        label,
        name,
        type,
        required,
      };

      if ((type === "dropdown" || type === "radio") && isStringArray(raw?.options)) {
        field.options = raw.options.map((o) => o.trim()).filter(Boolean);
      }

      if (type === "file") {
        if (isStringArray(raw?.accept)) field.accept = raw.accept.map((a) => a.trim()).filter(Boolean);
        const mb = raw?.max_file_size_bytes;
        if (typeof mb === "number" && Number.isFinite(mb) && mb > 0) field.max_file_size_bytes = mb;
      }

      return field;
    })
    .filter(Boolean) as ServiceCustomField[];
}

export function isFileType(field: ServiceCustomField) {
  return field.type === "file";
}

