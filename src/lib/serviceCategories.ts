/** Landing / admin service categories (must match DB `services.category` values). */
export const SERVICE_CATEGORY_PAPER = "Paper projects";
export const SERVICE_CATEGORY_GRAPHIC = "Graphic Design";
export const SERVICE_CATEGORY_XEROX = "Xerox and Prints";

export const SERVICE_CATEGORIES = [
  SERVICE_CATEGORY_PAPER,
  SERVICE_CATEGORY_GRAPHIC,
  SERVICE_CATEGORY_XEROX,
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** `landing_form_fields.category` values */
export const LANDING_FORM_CATEGORY_PAPER = "paper_projects";
export const LANDING_FORM_CATEGORY_GRAPHIC = "graphic_design";

export const LANDING_FORM_CATEGORIES = [LANDING_FORM_CATEGORY_PAPER, LANDING_FORM_CATEGORY_GRAPHIC] as const;
