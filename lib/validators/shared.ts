import { z } from "zod";

export const emptyToNull = (value: unknown) => {
  if (value === "" || value === undefined) return null;
  return value;
};

export const moneySchema = z.coerce.number().min(0, "Amount must be zero or greater.");

export const optionalMoneySchema = z.preprocess(
  emptyToNull,
  z.coerce.number().min(0, "Amount must be zero or greater.").nullable()
);

export const optionalStringSchema = z.preprocess(
  emptyToNull,
  z.string().trim().min(1).nullable()
);

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

export const uuidSchema = z.string().uuid();

export function zodFieldErrors(error: z.ZodError) {
  const flattened = error.flatten();
  return flattened.fieldErrors as Record<string, string[]>;
}
