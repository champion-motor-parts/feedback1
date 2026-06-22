import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { FEEDBACK_SERVICE_AREA_LABELS, FEEDBACK_TARGET_LABELS } from "@/lib/constants";

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

type FeedbackTargetRecord = {
  target_type?: string | null;
  target_label?: string | null;
  staff?: {
    name: string;
    position?: string | null;
  } | null;
};

export function feedbackTargetName(feedback: FeedbackTargetRecord) {
  if (feedback.target_type === "counter") return feedback.target_label || FEEDBACK_TARGET_LABELS.counter;
  if (feedback.target_type === "store") return feedback.target_label || FEEDBACK_TARGET_LABELS.store;
  return feedback.staff?.name || feedback.target_label || FEEDBACK_TARGET_LABELS.staff;
}

export function feedbackTargetPosition(feedback: FeedbackTargetRecord) {
  if (feedback.target_type === "staff") return feedback.staff?.position || "";
  return "";
}

export function feedbackServiceAreaName(area: string | null | undefined) {
  if (area === "showroom" || area === "repair" || area === "counter") {
    return FEEDBACK_SERVICE_AREA_LABELS[area];
  }
  return "-";
}

export function malaysiaPhoneIsValid(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  return /^(01\d{8,9}|\+601\d{8,9})$/.test(compact);
}
