import { z } from "zod";

export const adminProductSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(10000),
  type: z.enum(["SINGLE", "VARIABLE"]),
  mainImage: z.string().trim().min(1).max(2000),
  gallery: z.array(z.string().trim().min(1).max(2000)).max(30),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
  sku: z.string().trim().max(100).nullable(),
  collectionId: z.string().min(1),
  published: z.boolean(),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSelling: z.boolean(),
  variants: z
    .array(
      z.object({
        colorName: z.string().trim().max(80).nullable(),
        colorHex: z.string().trim().max(20).nullable(),
        size: z.string().trim().max(40).nullable(),
        sku: z.string().trim().max(100).nullable(),
        price: z.number().nonnegative().nullable(),
        stock: z.number().int().nonnegative(),
        image: z.string().trim().max(2000).nullable()
      })
    )
    .max(200)
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
