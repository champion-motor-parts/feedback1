import { format } from "date-fns";
import {
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Heart,
  Inbox,
  LineChart,
  ListFilter,
  MessageSquareWarning
} from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { MetricCard } from "@/components/MetricCard";
import { Shell, type ShellLink } from "@/components/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_STATUSES, COMPLAINT_TYPES, FEEDBACK_TYPES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { average } from "@/lib/stats";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardList },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

export default async function AdminDashboardPage() {
  const user = await requireUser("admin");
  const [feedbacks, branches, staff] = await Promise.all([
    prisma.feedback.findMany({
      include: { branch: true, staff: true, images: true },
      orderBy: { created_at: "desc" }
    }),
    prisma.branch.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({ where: { role: "staff" }, orderBy: { id: "asc" } })
  ]);

  const totalComplaints = feedbacks.filter((feedback) =>
    COMPLAINT_TYPES.includes(feedback.feedback_type as (typeof COMPLAINT_TYPES)[number])
  ).length;
  const totalCompliments = feedbacks.filter((feedback) => feedback.feedback_type === "Compliment").length;
  const thisMonth = new Date();
  const feedbackThisMonth = feedbacks.filter((feedback) => {
    const date = new Date(feedback.created_at);
    return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear();
  }).length;

  const byType = FEEDBACK_TYPES.map((type) => ({
    name: type,
    value: feedbacks.filter((feedback) => feedback.feedback_type === type).length
  }));
  const byBranch = branches.map((branch) => ({
    name: branch.name,
    value: feedbacks.filter((feedback) => feedback.branch_id === branch.id).length
  }));
  const byStaff = staff.map((person) => ({
    name: person.name,
    value: feedbacks.filter((feedback) => feedback.staff_id === person.id).length
  }));
  const averageByStaff = staff.map((person) => {
    const own = feedbacks.filter((feedback) => feedback.staff_id === person.id);
    return { name: person.name, value: average(own.map((feedback) => feedback.rating)) };
  });
  const complaintsByStaff = staff.map((person) => ({
    name: person.name,
    value: feedbacks.filter(
      (feedback) =>
        feedback.staff_id === person.id &&
        COMPLAINT_TYPES.includes(feedback.feedback_type as (typeof COMPLAINT_TYPES)[number])
    ).length
  }));
  const complimentsByStaff = staff.map((person) => ({
    name: person.name,
    value: feedbacks.filter((feedback) => feedback.staff_id === person.id && feedback.feedback_type === "Compliment").length
  }));
  const byStatus = CASE_STATUSES.map((status) => ({
    name: status,
    value: feedbacks.filter((feedback) => feedback.status === status).length
  }));
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dailyMap.set(format(date, "dd MMM"), 0);
  }
  feedbacks.forEach((feedback) => {
    const key = format(feedback.created_at, "dd MMM");
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  });
  const dailyTrend = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

  return (
    <Shell title="Admin Dashboard" subtitle="Objective feedback overview and export-ready data." userName={user.name} links={adminLinks}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Feedback" value={feedbacks.length} icon={Inbox} />
        <MetricCard label="Average Rating Overall" value={average(feedbacks.map((feedback) => feedback.rating))} icon={BarChart3} />
        <MetricCard label="Total Complaints" value={totalComplaints} icon={MessageSquareWarning} />
        <MetricCard label="Total Compliments" value={totalCompliments} icon={Heart} />
        <MetricCard label="New Cases" value={byStatus.find((item) => item.name === "New")?.value || 0} icon={ClipboardList} />
        <MetricCard label="In Progress Cases" value={byStatus.find((item) => item.name === "In Progress")?.value || 0} icon={Gauge} />
        <MetricCard label="Resolved Cases" value={byStatus.find((item) => item.name === "Resolved")?.value || 0} icon={CheckCircle2} />
        <MetricCard label="Escalated Cases" value={byStatus.find((item) => item.name === "Escalated")?.value || 0} icon={ListFilter} />
        <MetricCard label="Feedback With Photos" value={feedbacks.filter((feedback) => feedback.images.length).length} icon={Camera} />
        <MetricCard label="Feedback This Month" value={feedbackThisMonth} icon={LineChart} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Admin Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-neutral-600">
            These charts show raw counts, status distribution, and average ratings only. They do not label, score, or compare staff performance.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <AnalyticsCharts
          byType={byType}
          byBranch={byBranch}
          byStaff={byStaff}
          averageByStaff={averageByStaff}
          complaintsByStaff={complaintsByStaff}
          complimentsByStaff={complimentsByStaff}
          byStatus={byStatus}
          dailyTrend={dailyTrend}
        />
      </div>
    </Shell>
  );
}
