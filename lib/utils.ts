import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export const DISTRICTS = [
  "North Goa",
  "South Goa",
  "Panaji",
  "Margao",
  "Vasco",
  "Mapusa",
  "Ponda",
  "Bicholim",
  "Calangute",
  "Candolim",
] as const;

export const SPORT_TYPES = [
  "Football",
  "Cricket",
  "Kabaddi",
  "Volleyball",
  "Basketball",
  "Athletics",
  "Swimming",
  "Badminton",
  "Table Tennis",
  "Wrestling",
  "Boxing",
  "Chess",
  "Cycling",
] as const;

export const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  WAITLISTED: "bg-blue-100 text-blue-700 border-blue-200",
  PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ONGOING: "bg-violet-100 text-violet-700 border-violet-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
} as const;
