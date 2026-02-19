import { z } from "zod";

/**
 * Email Schema
 * - must be valid format
 * - normalized (lowercase + trim)
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email format");


/**
 * Password Schema (strong default)
 * - min 8 chars
 * - at least 1 uppercase
 * - at least 1 lowercase
 * - at least 1 number
 * - at least 1 special char
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");


/**
 * Name Schema
 * - min 2 chars
 * - max 50 chars
 * - only letters + spaces (adjust if needed)
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name too short")
  .max(50, "Name too long")
  .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces");
