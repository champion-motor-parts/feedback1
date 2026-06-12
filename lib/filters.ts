import type { Prisma } from "@prisma/client";

export function feedbackWhereFromSearch(searchParams: Record<string, string | string[] | undefined>) {
  const branch = single(searchParams.branch);
  const staff = single(searchParams.staff);
  const type = single(searchParams.type);
  const rating = single(searchParams.rating);
  const status = single(searchParams.status);
  const hasPhoto = single(searchParams.hasPhoto);
  const from = single(searchParams.from);
  const to = single(searchParams.to);

  const where: Prisma.FeedbackWhereInput = {};
  if (branch) where.branch_id = Number(branch);
  if (staff) where.staff_id = Number(staff);
  if (type) where.feedback_type = type;
  if (rating) where.rating = Number(rating);
  if (status) where.status = status;
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at.gte = new Date(`${from}T00:00:00`);
    if (to) where.created_at.lte = new Date(`${to}T23:59:59`);
  }
  if (hasPhoto === "yes") where.images = { some: {} };
  if (hasPhoto === "no") where.images = { none: {} };

  return where;
}

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value || "";
}
