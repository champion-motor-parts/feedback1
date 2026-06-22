import Link from "next/link";
import { BarChart3, Camera, ClipboardList, Download, Gauge, LineChart, ListFilter } from "lucide-react";
import { Shell, type ShellLink } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import {
  CASE_STATUSES,
  FEEDBACK_SERVICE_AREA_LABELS,
  FEEDBACK_SERVICE_AREAS,
  FEEDBACK_TARGET_LABELS,
  FEEDBACK_TARGET_TYPES,
  FEEDBACK_TYPES
} from "@/lib/constants";
import { feedbackWhereFromSearch } from "@/lib/filters";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackServiceAreaName, feedbackTargetName, formatDate, ratingStars } from "@/lib/utils";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardList },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

export default async function AdminFeedbackPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser("admin");
  const params = await searchParams;
  const where = feedbackWhereFromSearch(params);
  const [feedbacks, branches, staff] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { branch: true, staff: true, images: true },
      orderBy: { created_at: "desc" }
    }),
    prisma.branch.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({ where: { role: "staff" }, orderBy: { id: "asc" } })
  ]);

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const queryString = query.toString();

  return (
    <Shell title="Feedback Management" subtitle="Filter, review, update, and export customer feedback." userName={user.name} links={adminLinks}>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
            <Input name="from" type="date" defaultValue={params.from || ""} aria-label="From date" />
            <Input name="to" type="date" defaultValue={params.to || ""} aria-label="To date" />
            <Select name="branch" defaultValue={params.branch || ""} aria-label="Branch">
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </Select>
            <Select name="staff" defaultValue={params.staff || ""} aria-label="Staff">
              <option value="">All Staff</option>
              {staff.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </Select>
            <Select name="target" defaultValue={params.target || ""} aria-label="Feedback target">
              <option value="">All Targets</option>
              {FEEDBACK_TARGET_TYPES.map((target) => (
                <option key={target} value={target}>{FEEDBACK_TARGET_LABELS[target]}</option>
              ))}
            </Select>
            <Select name="area" defaultValue={params.area || ""} aria-label="Complaint area">
              <option value="">All Areas</option>
              {FEEDBACK_SERVICE_AREAS.map((area) => (
                <option key={area} value={area}>{FEEDBACK_SERVICE_AREA_LABELS[area]}</option>
              ))}
            </Select>
            <Select name="type" defaultValue={params.type || ""} aria-label="Feedback type">
              <option value="">All Types</option>
              {FEEDBACK_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Select name="rating" defaultValue={params.rating || ""} aria-label="Rating">
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>{rating} Star</option>
              ))}
            </Select>
            <Select name="status" defaultValue={params.status || ""} aria-label="Status">
              <option value="">All Status</option>
              {CASE_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            <Select name="hasPhoto" defaultValue={params.hasPhoto || ""} aria-label="Photo filter">
              <option value="">Photo: Any</option>
              <option value="yes">Has Photo</option>
              <option value="no">No Photo</option>
            </Select>
            <button className={buttonClass()} type="submit">Apply Filters</button>
            <Link href="/admin/feedback" className={buttonClass({ variant: "secondary" })}>Clear</Link>
            <a href={`/api/admin/export/feedback${queryString ? `?${queryString}` : ""}`} className={buttonClass({ variant: "secondary" })}>
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Feedback ({feedbacks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="py-3 pr-4">Case ID</th>
                  <th className="py-3 pr-4">Customer Name</th>
                  <th className="py-3 pr-4">Phone Number</th>
                  <th className="py-3 pr-4">Branch</th>
                  <th className="py-3 pr-4">Area</th>
                  <th className="py-3 pr-4">Target</th>
                  <th className="py-3 pr-4">Feedback Type</th>
                  <th className="py-3 pr-4">Rating</th>
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
                    <td className="py-3 pr-4">{feedback.branch.name}</td>
                    <td className="py-3 pr-4">{feedbackServiceAreaName(feedback.service_area)}</td>
                    <td className="py-3 pr-4">{feedbackTargetName(feedback)}</td>
                    <td className="py-3 pr-4">{feedback.feedback_type}</td>
                    <td className="py-3 pr-4">{ratingStars(feedback.rating)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={feedback.status} /></td>
                    <td className="py-3 pr-4">{formatDate(feedback.created_at)}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/feedback/${feedback.id}`} className={buttonClass({ variant: "secondary", size: "sm" })}>
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
