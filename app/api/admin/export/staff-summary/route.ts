import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { staffRawSummary } from "@/lib/stats";
import { feedbackServiceAreaName } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  await requireUser("admin");
  const [staff, feedbacks, branches] = await Promise.all([
    prisma.user.findMany({
      where: { role: "staff", status: "Active" },
      include: { branch: true },
      orderBy: { id: "asc" }
    }),
    prisma.feedback.findMany({
      include: { staff: true, branch: true, images: true }
    }),
    prisma.branch.findMany({
      where: { status: "Active" },
      orderBy: { id: "asc" }
    })
  ]);
  const summary = staffRawSummary(staff, feedbacks, branches);

  const headers = [
    "Staff Name",
    "Staff Code",
    "Area",
    "Branch",
    "Total Feedback",
    "Average Rating",
    "Rating 1 Count",
    "Rating 2 Count",
    "Rating 3 Count",
    "Rating 4 Count",
    "Rating 5 Count",
    "Product Issue Count",
    "Installation Issue Count",
    "Service Attitude Count",
    "Slow Reply Count",
    "Wrong Item Count",
    "Warranty Count",
    "Compliment Count",
    "New Cases",
    "In Progress Cases",
    "Waiting Customer Cases",
    "Resolved Cases",
    "Escalated Cases"
  ];

  const rows = summary.map((row) => [
    row.staff.name,
    row.staff.staff_code || "",
    feedbackServiceAreaName(row.staff.service_area),
    row.branchName,
    row.totalFeedback,
    row.averageRating,
    row.ratingCounts[1],
    row.ratingCounts[2],
    row.ratingCounts[3],
    row.ratingCounts[4],
    row.ratingCounts[5],
    row.typeCounts["Product Issue"],
    row.typeCounts["Installation Issue"],
    row.typeCounts["Service Attitude"],
    row.typeCounts["Slow Reply"],
    row.typeCounts["Wrong Item"],
    row.typeCounts["Warranty / Claim"],
    row.typeCounts["Compliment"],
    row.statusCounts["New"],
    row.statusCounts["In Progress"],
    row.statusCounts["Waiting Customer"],
    row.statusCounts["Resolved"],
    row.statusCounts["Escalated"]
  ]);

  return new NextResponse(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staff-summary-export.csv"`
    }
  });
}
