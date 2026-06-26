"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CASE_STATUSES, FEEDBACK_SERVICE_AREAS, STAFF_STATUS } from "@/lib/constants";
import { createSessionToken, requireUser, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackLink } from "@/lib/utils";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

function safeRedirect(path: string, fallback: string) {
  redirect(path.startsWith("/") ? path : fallback);
}

async function ensureStaffQRCode(staffId: number) {
  const data = {
    type: "staff",
    staff_id: staffId,
    branch_id: null,
    qr_url: feedbackLink({ staffId })
  };
  const existing = await prisma.qRCode.findFirst({
    where: {
      type: "staff",
      staff_id: staffId
    }
  });

  if (existing) {
    await prisma.qRCode.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.qRCode.create({ data });
}

export async function loginAction(formData: FormData) {
  const role = text(formData, "role") as "admin" | "staff";
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const loginPath = role === "admin" ? "/admin/login" : "/staff/login";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== role || user.status !== "Active") {
    redirect(`${loginPath}?error=invalid`);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) redirect(`${loginPath}?error=invalid`);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect(role === "admin" ? "/admin" : "/staff");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/feedback");
}

export async function updateCaseAction(formData: FormData) {
  const user = await requireUser();
  const feedbackId = numberValue(formData, "feedbackId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  const returnTo = text(formData, "returnTo");

  if (!CASE_STATUSES.includes(status as (typeof CASE_STATUSES)[number])) {
    throw new Error("Invalid case status");
  }

  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw new Error("Feedback not found");
  if (user.role === "staff" && feedback.staff_id !== user.id) {
    throw new Error("You can only update your own cases");
  }

  await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      status,
      resolved_at: status === "Resolved" ? new Date() : null
    }
  });

  if (note) {
    await prisma.caseNote.create({
      data: {
        feedback_id: feedbackId,
        user_id: user.id,
        note
      }
    });
  }

  revalidatePath("/staff");
  revalidatePath("/admin");
  revalidatePath("/admin/feedback");
  safeRedirect(returnTo, user.role === "admin" ? `/admin/feedback/${feedbackId}` : `/staff/cases/${feedbackId}`);
}

export async function saveStaffAction(formData: FormData) {
  await requireUser("admin");
  const id = numberValue(formData, "id");
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const position = text(formData, "position");
  const staffCode = text(formData, "staffCode");
  const serviceArea = text(formData, "serviceArea") || "showroom";
  const imageUrl = text(formData, "imageUrl");
  const status = text(formData, "status") || "Active";
  const branchId = numberValue(formData, "branchId");
  const password = text(formData, "password");

  if (!name || !email || !branchId) redirect("/admin/staff?error=missing");
  if (!STAFF_STATUS.includes(status as (typeof STAFF_STATUS)[number])) redirect("/admin/staff?error=status");
  if (!FEEDBACK_SERVICE_AREAS.includes(serviceArea as (typeof FEEDBACK_SERVICE_AREAS)[number])) redirect("/admin/staff?error=area");

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (id && existingByEmail && existingByEmail.id !== id) redirect("/admin/staff?error=email");
  if (!id && existingByEmail && existingByEmail.role !== "staff") redirect("/admin/staff?error=email");

  if (id) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "staff") redirect("/admin/staff?error=missing");
    const data: {
      name: string;
      email: string;
      phone: string;
      position: string;
      staff_code: string;
      service_area: string;
      image_url: string | null;
      status: string;
      branch_id: number;
      password_hash?: string;
    } = {
      name,
      email,
      phone,
      position,
      staff_code: staffCode,
      service_area: serviceArea,
      image_url: imageUrl || existing.image_url || null,
      status,
      branch_id: branchId
    };
    if (password) data.password_hash = await bcrypt.hash(password, 10);
    const staff = await prisma.user.update({ where: { id }, data });
    await ensureStaffQRCode(staff.id);
  } else {
    const data = {
      name,
      email,
      phone,
      position,
      staff_code: staffCode,
      service_area: serviceArea,
      image_url: imageUrl || existingByEmail?.image_url || null,
      status,
      role: "staff",
      branch_id: branchId,
      password_hash: password ? await bcrypt.hash(password, 10) : existingByEmail?.password_hash || await bcrypt.hash("Staff123!", 10)
    };
    const staff = existingByEmail
      ? await prisma.user.update({ where: { id: existingByEmail.id }, data })
      : await prisma.user.create({ data });
    await ensureStaffQRCode(staff.id);
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function deactivateStaffAction(formData: FormData) {
  await requireUser("admin");
  const id = numberValue(formData, "id");
  await prisma.user.update({ where: { id }, data: { status: "Inactive" } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function saveBranchAction(formData: FormData) {
  await requireUser("admin");
  const id = numberValue(formData, "id");
  const name = text(formData, "name");
  const address = text(formData, "address");
  const phone = text(formData, "phone");
  const status = text(formData, "status") || "Active";

  if (!name) throw new Error("Branch name is required");
  if (!STAFF_STATUS.includes(status as (typeof STAFF_STATUS)[number])) throw new Error("Invalid branch status");

  if (id) {
    await prisma.branch.update({ where: { id }, data: { name, address, phone, status } });
  } else {
    const branch = await prisma.branch.create({ data: { name, address, phone, status } });
    await prisma.qRCode.create({
      data: {
        type: "branch",
        branch_id: branch.id,
        qr_url: feedbackLink({ branchId: branch.id })
      }
    });
  }

  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}

export async function deactivateBranchAction(formData: FormData) {
  await requireUser("admin");
  const id = numberValue(formData, "id");
  await prisma.branch.update({ where: { id }, data: { status: "Inactive" } });
  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}
