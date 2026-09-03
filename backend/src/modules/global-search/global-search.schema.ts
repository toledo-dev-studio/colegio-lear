import { z } from "zod";

/**
 * Validates GET /global-search query params.
 * Minimum length matches the frontend's own debounce gate (GlobalSearchInput
 * only fires once the term reaches 5 chars) — enforced here too so the
 * endpoint can't be hit directly with a 1-2 char term, which would be the
 * most expensive possible case across every searchable module.
 */
export const globalSearchQuerySchema = z.object({
  q: z.string().min(5, "q debe tener al menos 5 caracteres").max(100),
});
