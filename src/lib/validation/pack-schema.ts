import { z } from "zod";

export const CreatePackSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título no puede exceder 120 caracteres"),
  japaneseTitle: z
    .string()
    .min(1, "Se requiere el título en japonés / kanji")
    .max(80),
  slug: z.string().optional(),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  heroImage: z.string().min(1, "Se requiere la URL o ruta de la imagen"),
  priceBaseUsd: z.number().positive("El precio debe ser un número positivo"),
  seasonTag: z.enum(["sakura", "nebuta", "koyo", "snow"], {
    message: "La temporada debe ser: sakura, nebuta, koyo o snow",
  }),
  seasonLabel: z.string().min(2, "Se requiere la etiqueta de temporada"),
  durationDays: z
    .number()
    .int()
    .min(1, "La duración debe ser de al menos 1 día")
    .max(30, "La duración no puede exceder 30 días"),
  highlights: z
    .array(z.string().min(1))
    .min(1, "Debes incluir al menos un punto destacado (highlight)"),
  itinerarySummary: z
    .array(
      z.object({
        day: z.number().int().positive(),
        title: z.string().min(1),
      })
    )
    .min(1, "Debes incluir al menos un día en el itinerario"),
});

export type CreatePackInput = z.infer<typeof CreatePackSchema>;
