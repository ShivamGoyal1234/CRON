import { z } from "zod";
import { isValidUrl } from "@/lib/utils";

export const jobSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().refine((value) => isValidUrl(value), "Invalid URL format"),
  method: z.enum(["GET", "POST"]),
  headers: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  interval: z.number().int(),
  isActive: z.boolean().optional(),
});
