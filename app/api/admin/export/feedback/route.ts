import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { feedbackWhereFromSearch } from "@/lib/filters";
import { prisma } from "@/lib/prisma";
import { feedbackServiceAreaName, feedbackTargetName, feedbackTargetPosition, formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireUser("admin");
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const feedbacks = await prisma.feedback.findMany({
    where: feedbackWhereFromSearch(params),
    include: {
      branch: true,
      staff: true,
      images: true,
      notes: { orderBy: { created_at: "asc" } }
    },
    orderBy: { created_at: "desc" }
  });

  const headers = [
    "Case ID",
    "Branch",
    "Complaint Area",
    "Target Type",
    "Target Name",
    "Staff Code",
    "Staff Position",
    "Customer Name",
    "Customer Phone",
    "Feedback Type",
    "Rating",
    "Comment",
    "Status",
    "Created Date",
    "Updated Date",
    "Resolved Date",
    "Internal Notes",
    "Photo URLs"
  ];

  const rows = feedbacks.map((feedback) => [
    feedback.case_id,
    feedback.branch.name,
    feedbackServiceAreaName(feedback.service_area),
    feedback.target_type || "staff",
    feedbackTargetName(feedback),
    feedback.staff?.staff_code || "",
    feedbackTargetPosition(feedback),
    feedback.customer_name || "",
    feedback.customer_phone,
    feedback.feedback_type,
    feedback.rating,
    feedback.comment,
    feedback.status,
    formatDateTime(feedback.created_at),
    formatDateTime(feedback.updated_at),
    formatDateTime(feedback.resolved_at),
    feedback.notes.map((note) => note.note).join(" | "),
    feedback.images.map((image) => image.image_url).join(" | ")
  ]);

  return new NextResponse(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-export.csv"`
    }
  });
}
