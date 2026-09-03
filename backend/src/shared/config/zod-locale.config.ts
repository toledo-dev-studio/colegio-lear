import { z } from "zod";

/**
 * Sets Zod's built-in error messages to Spanish globally. Must be imported
 * once, before any schema is used, so every validate.middleware.ts failure
 * across the app comes back in Spanish (e.g. "Invalid input: expected
 * string, received undefined" -> "Entrada inválida: se esperaba string,
 * se recibió undefined") without touching each individual schema file.
 */
z.config(z.locales.es());
