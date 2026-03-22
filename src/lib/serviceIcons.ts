import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Printer,
  Copy,
  BookOpen,
  Book,
  Disc,
  GraduationCap,
  School,
  ImageIcon,
} from "lucide-react";

export const SERVICE_LUCIDE_ICONS: Record<string, LucideIcon> = {
  FileText,
  Printer,
  Copy,
  BookOpen,
  Book,
  Disc,
  GraduationCap,
  School,
  ImageIcon,
};

export const SERVICE_LUCIDE_ICON_NAMES = Object.keys(SERVICE_LUCIDE_ICONS) as string[];

export function isIconImageUrl(icon: string | null | undefined): boolean {
  if (!icon?.trim()) return false;
  return /^https?:\/\//i.test(icon) || icon.startsWith("/");
}
