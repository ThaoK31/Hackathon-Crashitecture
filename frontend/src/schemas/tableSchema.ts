import { z } from "zod";

export const tableSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  location: z
    .string()
    .min(1, "La localisation est requise")
    .min(3, "La localisation doit contenir au moins 3 caractères")
    .max(100, "La localisation ne peut pas dépasser 100 caractères"),
  condition: z.enum(["EXCELLENT", "GOOD", "WORN", "NEEDS_MAINTENANCE"]),
  is_available: z.boolean(),
});

export type TableFormData = z.infer<typeof tableSchema>;

