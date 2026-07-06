import { NextResponse } from "next/server";
import { counterSlotsForBranchName, FEEDBACK_SERVICE_AREAS, FEEDBACK_TARGET_LABELS, FEEDBACK_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { malaysiaPhoneIsValid } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const branchId = Number(formData.get("branchId"));
  const staffId = Number(formData.get("staffId"));
  const serviceArea = String(formData.get("serviceArea") || "showroom");
  const counterSlot = String(formData.get("targetLabel") || "");
  const feedbackType = String(formData.get("feedbackType") || "General Feedback");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  const customerName = String(formData.get("customerName") || "").trim();
  const customerBirthDateValue = String(formData.get("customerBirthDate") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const customerBirthDate = customerBirthDateValue ? new Date(`${customerBirthDateValue}T00:00:00.000Z`) : null;

  if (!FEEDBACK_SERVICE_AREAS.includes(serviceArea as (typeof FEEDBACK_SERVICE_AREAS)[number])) {
    return NextResponse.json({ error: "Invalid complaint area." }, { status: 400 });
  }
  if (!branchId || !feedbackType || !rating || !comment || !customerPhone || (serviceArea !== "counter" && !staffId)) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (!FEEDBACK_TYPES.includes(feedbackType as (typeof FEEDBACK_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid complaint type." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (customerBirthDateValue && Number.isNaN(customerBirthDate?.getTime())) {
    return NextResponse.json({ error: "Invalid birthday." }, { status: 400 });
  }
  if (!malaysiaPhoneIsValid(customerPhone)) {
    return NextResponse.json({ error: "Invalid Malaysia phone number." }, { status: 400 });
  }

  const branch = await prisma.branch.findFirst({ where: { id: branchId, status: "Active" } });
  if (!branch) {
    return NextResponse.json({ error: "Selected branch is not available." }, { status: 400 });
  }
  const allowedCounterSlots = counterSlotsForBranchName(branch.name).map((slot) => slot.toLowerCase());
  if (serviceArea === "counter" && !allowedCounterSlots.includes(counterSlot.toLowerCase())) {
    return NextResponse.json({ error: "Invalid counter selection for this branch." }, { status: 400 });
  }

  const targetType = serviceArea === "counter" ? "counter" : "staff";

  const staff = targetType === "staff"
    ? await prisma.user.findFirst({
        where: {
          id: staffId,
          role: "staff",
          status: "Active",
          branch_id: branchId,
          service_area: serviceArea
        }
      })
    : null;
  const counterStaff = targetType === "counter"
    ? await prisma.user.findFirst({
        where: {
          role: "staff",
          status: "Active",
          branch_id: branchId,
          service_area: "counter",
          name: {
            equals: counterSlot,
            mode: "insensitive"
          }
        }
      })
    : null;
  if (targetType === "staff" && !staff) {
    return NextResponse.json({ error: "Selected staff is not available for this branch and area." }, { status: 400 });
  }

  const targetLabel = targetType === "staff"
    ? staff?.name || FEEDBACK_TARGET_LABELS.staff
    : counterStaff?.name || counterSlot;

  const files = targetType === "staff"
    ? formData.getAll("photos").filter((item) => item instanceof File && item.size > 0) as File[]
    : [];
  if (files.length > 3) {
    return NextResponse.json({ error: "Please upload up to 3 photos only." }, { status: 400 });
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WebP images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Each photo must be 3 MB or smaller." }, { status: 400 });
    }
  }

  const count = await prisma.feedback.count();
  const caseId = `FB-${String(count + 1).padStart(6, "0")}`;

  const imageUrls: string[] = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    imageUrls.push(`data:${file.type};base64,${bytes.toString("base64")}`);
  }

  const feedback = await prisma.feedback.create({
    data: {
      case_id: caseId,
      branch_id: branchId,
      staff_id: targetType === "staff" ? staffId : counterStaff?.id || null,
      target_type: targetType,
      target_label: targetLabel,
      service_area: serviceArea,
      customer_name: customerName || null,
      customer_birth_date: customerBirthDate,
      customer_phone: customerPhone,
      feedback_type: feedbackType,
      rating,
      comment,
      status: "New",
      priority: rating <= 2 ? "High" : "Normal",
      images: {
        create: imageUrls.map((image_url) => ({ image_url }))
      }
    }
  });

  return NextResponse.json({ caseId: feedback.case_id });
}
