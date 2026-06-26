import { BarChart3, Camera, ClipboardList, Download, Gauge, LineChart, ListFilter } from "lucide-react";
import { Shell, type ShellLink } from "@/components/Shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { staffRawSummary } from "@/lib/stats";
import { feedbackServiceAreaName } from "@/lib/utils";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardList },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

export default async function StaffDataPage() {
  const user = await requireUser("admin");
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
  const rows = staffRawSummary(staff, feedbacks, branches);

  return (
    <Shell title="Staff Data" subtitle="Raw counts and distribution data for boss review." userName={user.name} links={adminLinks}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          This page shows objective counts only: total feedback, average rating, rating distribution, feedback type counts, and case status counts.
        </p>
        <a href="/api/admin/export/staff-summary" className={buttonClass({ variant: "secondary" })}>
          <Download className="h-4 w-4" />
          Export Staff Summary
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Staff Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  {[
                    "Staff Name",
                    "Staff Code",
                    "Area",
                    "Branch",
                    "Total Feedback",
                    "Average Rating",
                    "1 Star Count",
                    "2 Star Count",
                    "3 Star Count",
                    "4 Star Count",
                    "5 Star Count",
                    "Product Issue Count",
                    "Installation Issue Count",
                    "Service Attitude Count",
                    "Slow Reply Count",
                    "Wrong Item Count",
                    "Warranty / Claim Count",
                    "Compliment Count",
                    "New Cases",
                    "In Progress Cases",
                    "Waiting Customer Cases",
                    "Resolved Cases",
                    "Escalated Cases"
                  ].map((heading) => (
                    <th key={heading} className="py-3 pr-4">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.staff.id}>
                    <td className="py-3 pr-4 font-semibold">{row.staff.name}</td>
                    <td className="py-3 pr-4">{row.staff.staff_code || "-"}</td>
                    <td className="py-3 pr-4">{feedbackServiceAreaName(row.staff.service_area)}</td>
                    <td className="py-3 pr-4">{row.branchName}</td>
                    <td className="py-3 pr-4">{row.totalFeedback}</td>
                    <td className="py-3 pr-4">{row.averageRating}</td>
                    <td className="py-3 pr-4">{row.ratingCounts[1]}</td>
                    <td className="py-3 pr-4">{row.ratingCounts[2]}</td>
                    <td className="py-3 pr-4">{row.ratingCounts[3]}</td>
                    <td className="py-3 pr-4">{row.ratingCounts[4]}</td>
                    <td className="py-3 pr-4">{row.ratingCounts[5]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Product Issue"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Installation Issue"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Service Attitude"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Slow Reply"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Wrong Item"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Warranty / Claim"]}</td>
                    <td className="py-3 pr-4">{row.typeCounts["Compliment"]}</td>
                    <td className="py-3 pr-4">{row.statusCounts["New"]}</td>
                    <td className="py-3 pr-4">{row.statusCounts["In Progress"]}</td>
                    <td className="py-3 pr-4">{row.statusCounts["Waiting Customer"]}</td>
                    <td className="py-3 pr-4">{row.statusCounts["Resolved"]}</td>
                    <td className="py-3 pr-4">{row.statusCounts["Escalated"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
