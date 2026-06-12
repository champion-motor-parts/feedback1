import { NextResponse } from "next/server";
import { FEEDBACK_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { malaysiaPhoneIsValid } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const branchId = Number(formData.get("branchId"));
  const staffId = Number(formData.get("staffId"));
  const feedbackType = String(formData.get("feedbackType") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();

  if (!branchId || !staffId || !feedbackType || !rating || !comment || !customerPhone) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (!FEEDBACK_TYPES.includes(feedbackType as (typeof FEEDBACK_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid feedback type." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (!malaysiaPhoneIsValid(customerPhone)) {
    return NextResponse.json({ error: "Invalid Malaysia phone number." }, { status: 400 });
  }

  const [branch, staff] = await Promise.all([
    prisma.branch.findFirst({ where: { id: branchId, status: "Active" } }),
    prisma.user.findFirst({ where: { id: staffId, role: "staff", status: "Active" } })
  ]);
  if (!branch || !staff) {
    return NextResponse.json({ error: "Selected branch or staff is not available." }, { status: 400 });
  }

  const files = formData.getAll("photos").filter((item) => item instanceof File && item.size > 0) as File[];
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
      staff_id: staffId,
      customer_name: customerName || null,
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
