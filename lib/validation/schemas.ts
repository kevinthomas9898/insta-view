import { z } from 'zod';

// Username: 1-30 chars, letters, numbers, periods, underscores
export const usernameSchema = z
  .string()
  .trim()
  .min(1, 'Username is required')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores')
  .transform((val) => val.toLowerCase().replace(/^@/, ''));

export const apiQuerySchema = z.object({
  username: usernameSchema,
  demo: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  maxId: z.string().optional(),
});

export const mediaQuerySchema = z.object({
  url: z.string().url('Invalid media URL'),
  download: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  filename: z.string().optional(),
});
