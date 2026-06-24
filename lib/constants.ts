export const FEEDBACK_TYPES = [
  "Product Issue",
  "Installation Issue",
  "Service Attitude",
  "Slow Reply",
  "Wrong Item",
  "Warranty / Claim",
  "Compliment",
  "General Feedback",
  "Other"
] as const;

export const CASE_STATUSES = [
  "New",
  "In Progress",
  "Waiting Customer",
  "Resolved",
  "Escalated"
] as const;

export const STAFF_STATUS = ["Active", "Inactive"] as const;

export const FEEDBACK_TARGET_TYPES = ["staff", "counter", "store"] as const;

export const FEEDBACK_TARGET_LABELS: Record<(typeof FEEDBACK_TARGET_TYPES)[number], string> = {
  staff: "Staff",
  counter: "Counter",
  store: "Overall Store"
};

export const FEEDBACK_SERVICE_AREAS = ["showroom", "repair", "counter"] as const;

export const FEEDBACK_SERVICE_AREA_LABELS: Record<(typeof FEEDBACK_SERVICE_AREAS)[number], string> = {
  showroom: "Showroom",
  repair: "Repair",
  counter: "Counter"
};

export const COUNTER_SLOTS = ["apek", "pendek", "acu"] as const;

export const COMPLAINT_TYPES = [
  "Product Issue",
  "Installation Issue",
  "Service Attitude",
  "Slow Reply",
  "Wrong Item",
  "Warranty / Claim"
] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Very Bad",
  2: "Bad",
  3: "Normal",
  4: "Good",
  5: "Excellent"
};

export const CHART_COLORS = [
  "#c8102e",
  "#121212",
  "#2563eb",
  "#0f766e",
  "#9333ea",
  "#d97706",
  "#475569",
  "#16a34a",
  "#64748b"
];
