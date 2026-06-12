import Link from "next/link";
import { ClipboardList, Clock3, Inbox, ListChecks, Wrench } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Shell, type ShellLink } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, ratingStars } from "@/lib/utils";

const staffLinks: ShellLink[] = [
  { href: "/staff", label: "My Cases", icon: ClipboardList }
];

export default async function StaffDashboardPage() {
  const user = await requireUser("staff");
  const feedbacks = await prisma.feedback.findMany({
    where: { staff_id: user.id },
    include: { branch: true, images: true },
    orderBy: { created_at: "desc" }
  });

  const newCases = feedbacks.filter((feedback) => feedback.status === "New").length;
  const inProgress = feedbacks.filter((feedback) => feedback.status === "In Progress").length;
  const resolved = feedbacks.filter((feedback) => feedback.status === "Resolved").length;
  const unresolved = feedbacks.filter((feedback) => feedback.status !== "Resolved").length;

  return (
    <Shell title="Staff Dashboard" subtitle="Customer cases assigned to your account." userName={user.name} links={staffLinks}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Feedback" value={feedbacks.length} icon={Inbox} />
        <MetricCard label="New Cases" value={newCases} icon={Clock3} />
        <MetricCard label="In Progress Cases" value={inProgress} icon={Wrench} />
        <MetricCard label="Resolved Cases" value={resolved} icon={ListChecks} />
        <MetricCard label="Unresolved Cases" value={unresolved} icon={ClipboardList} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Case List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="py-3 pr-4">Case ID</th>
                  <th className="py-3 pr-4">Customer Name</th>
                  <th className="py-3 pr-4">Customer Phone</th>
                  <th className="py-3 pr-4">Feedback Type</th>
                  <th className="py-3 pr-4">Rating</th>
                  <th className="py-3 pr-4">Comment Preview</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created Date</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td className="py-3 pr-4 font-semibold">{feedback.case_id}</td>
                    <td className="py-3 pr-4">{feedback.customer_name || "-"}</td>
                    <td className="py-3 pr-4">{feedback.customer_phone}</td>
                    <td className="py-3 pr-4">{feedback.feedback_type}</td>
                    <td className="py-3 pr-4">{ratingStars(feedback.rating)}</td>
                    <td className="max-w-xs truncate py-3 pr-4">{feedback.comment}</td>
                    <td className="py-3 pr-4"><StatusBadge status={feedback.status} /></td>
                    <td className="py-3 pr-4">{formatDate(feedback.created_at)}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/staff/cases/${feedback.id}`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                        View
                      </Link>
                    </td>
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
