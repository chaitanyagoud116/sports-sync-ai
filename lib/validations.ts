import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([
    "ATHLETE",
    "COACH",
    "VENUE_MANAGER",
    "DISTRICT_OFFICER",
    "ADMIN",
    "GOV_ADMIN",
    "TOURNAMENT_ORGANIZER",
  ]),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z.string().min(5, "Address is required"),
  district: z.string().min(1, "District is required"),
  sport: z.string().min(1, "Sport category is required"),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]),
  aadhaar: z.string().optional(),
});

// ── Tournament ────────────────────────────────────────────────────────────────
export const tournamentSchema = z.object({
  name: z.string().min(3, "Tournament name is required"),
  sport: z.string().min(1, "Sport is required"),
  category: z.string().min(1, "Category is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  venueId: z.string().min(1, "Venue is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  maxParticipants: z.number().min(2, "At least 2 participants required"),
  description: z.string().min(10, "Description is required"),
  requiredDocuments: z.string().min(1, "Required documents is required"),
});

// ── Application ───────────────────────────────────────────────────────────────
export const applySchema = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  declaration: z.boolean().refine((v) => v === true, "You must accept the declaration"),
});

// ── Venue ─────────────────────────────────────────────────────────────────────
export const venueSchema = z.object({
  name: z.string().min(3, "Venue name is required"),
  location: z.string().min(5, "Location is required"),
  district: z.string().min(1, "District is required"),
  capacity: z.number().min(10, "Capacity must be at least 10"),
  venueType: z.string().min(1, "Venue type is required"),
  facilities: z.string().min(1, "Facilities are required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TournamentInput = z.infer<typeof tournamentSchema>;
export type ApplyInput = z.infer<typeof applySchema>;
export type VenueInput = z.infer<typeof venueSchema>;
