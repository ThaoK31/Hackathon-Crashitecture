import { z } from "zod";

export const reservationSchema = z.object({
  table_id: z.string().min(1, "Veuillez sélectionner une table"),
  start_time: z.string().min(1, "Veuillez sélectionner une date et heure"),
  duration: z.number().min(15, "La durée minimum est de 15 minutes").max(180, "La durée maximum est de 3 heures"),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// Durées prédéfinies en minutes
export const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 heure" },
  { value: 120, label: "2 heures" },
  { value: 180, label: "3 heures" },
] as const;

