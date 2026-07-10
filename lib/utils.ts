import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FEEDBACK_SERVICE_AREA_LABELS, FEEDBACK_TARGET_LABELS } from "@/lib/constants";

const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: MALAYSIA_TIME_ZONE
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: MALAYSIA_TIME_ZONE
  }).format(new Date(value));
}

export function malaysiaDateRange(date: string, endOfDay = false) {
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+08:00`);
}

export function malaysiaDayKey(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: MALAYSIA_TIME_ZONE
  }).format(new Date(value));
}

export function malaysiaDateParts(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: MALAYSIA_TIME_ZONE
  }).formatToParts(new Date(value));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
  return { year: get("year"), month: get("month"), day: get("day") };
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

export function complaintTypeName(type: string | null | undefined) {
  if (!type) return "-";
  if (type === "General Feedback") return "General Complaint";
  return type;
}

export function malaysiaPhoneIsValid(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  return /^(01\d{8,9}|\+601\d{8,9})$/.test(compact);
}
