import { z } from "zod";

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Give this category a name.").max(120),
  description: z.string().max(2000).optional(),
  coverMediaId: z.string().uuid().optional().nullable(),
  published: z.boolean().optional().default(true),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  ogMediaId: z.string().uuid().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
