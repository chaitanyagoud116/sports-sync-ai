import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address').max(255);

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number validation (Indian format)
export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');

// Aadhaar validation (last 4 digits only for security)
export const aadhaarLastFourSchema = z.string()
  .regex(/^\d{4}$/, 'Aadhaar last 4 digits must be exactly 4 digits');

// File validation
export const fileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.enum(['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
});

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Validate file type
export function isValidFileType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return allowedTypes.includes(mimeType);
}

// Validate file size
export function isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mask sensitive data for logging
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '***';
  return data.substring(0, visibleChars) + '***';
}

// Validate role
export const roleSchema = z.enum([
  'ATHLETE',
  'ADMIN',
  'GOV_ADMIN',
  'COACH',
  'VENUE_MANAGER',
  'DISTRICT_OFFICER',
  'TOURNAMENT_ORGANIZER',
]);

// Validate URL
export const urlSchema = z.string().url('Invalid URL').max(2048);
