import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function feedbackLink(params: { staffId?: number; branchId?: number }) {
  const url = new URL("/feedback", appUrl());
  if (params.staffId) url.searchParams.set("staffId", String(params.staffId));
  if (params.branchId) url.searchParams.set("branchId", String(params.branchId));
  return url.toString();
}

export function ratingStars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, Math.max(0, 5 - rating));
}

export function malaysiaPhoneIsValid(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  return /^(01\d{8,9}|\+601\d{8,9})$/.test(compact);
}
