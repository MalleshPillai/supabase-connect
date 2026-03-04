import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingMap {
  [key: string]: number;
}

export const usePricing = () => {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing").select("*");
      if (error) throw error;
      const map: PricingMap = {};
      data.forEach((p: any) => {
        map[p.key] = Number(p.value);
      });
      return map;
    },
  });
};

export const calculateTotal = (
  pricing: PricingMap,
  options: {
    numPages: number;
    numCopies: number;
    colorMode: string;
    firstPageColor: boolean;
    firstPagePhotoSheet: boolean;
    glassWhiteSheet: boolean;
    serviceSlug: string;
  }
) => {
  const pageRate =
    options.colorMode === "color"
      ? pricing.price_per_page_color || 3
      : pricing.price_per_page_bw || 0.9;

  const subtotal = options.numPages * options.numCopies * pageRate;

  let bindingCharges = 0;
  if (options.serviceSlug.includes("hard-binding")) bindingCharges = pricing.hard_binding || 50;
  else if (options.serviceSlug.includes("soft-binding")) bindingCharges = pricing.soft_binding || 30;
  else if (options.serviceSlug.includes("book-binding")) bindingCharges = pricing.book_binding || 60;
  else if (options.serviceSlug.includes("spiral-binding")) bindingCharges = pricing.spiral_binding || 25;

  let specialCharges = 0;
  if (options.firstPageColor) specialCharges += pricing.first_page_color || 5;
  if (options.firstPagePhotoSheet) specialCharges += pricing.photo_sheet || 10;
  if (options.glassWhiteSheet) specialCharges += pricing.glass_white_sheet || 5;

  const total = subtotal + bindingCharges + specialCharges;

  return { subtotal, bindingCharges, specialCharges, total };
};
