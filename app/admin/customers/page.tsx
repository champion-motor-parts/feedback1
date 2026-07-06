import { format } from "date-fns";
import { BarChart3, Camera, ClipboardList, Gauge, LineChart, ListFilter, Users } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Shell, type ShellLink } from "@/components/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { complaintTypeName, formatDate } from "@/lib/utils";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Complaints", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

type CustomerRecord = {
  key: string;
  name: string;
  phone: string;
  birthday: Date | null;
  totalComplaints: number;
  latestDate: Date;
  latestType: string;
  branches: Set<string>;
};

function birthdayText(value: Date | null) {
  return value ? format(value, "dd MMM yyyy") : "-";
}

function nextBirthdayText(value: Date | null) {
  if (!value) return "-";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let nextBirthday = new Date(today.getFullYear(), value.getMonth(), value.getDate());
  if (nextBirthday < startToday) {
    nextBirthday = new Date(today.getFullYear() + 1, value.getMonth(), value.getDate());
  }
  const days = Math.ceil((nextBirthday.getTime() - startToday.getTime()) / 86400000);
  if (days === 0) return "Today";
  return `${format(nextBirthday, "dd MMM")} (${days} days)`;
}

export default async function AdminCustomersPage() {
  const user = await requireUser("admin");
  const complaints = await prisma.feedback.findMany({
    include: { branch: true },
    orderBy: { created_at: "desc" }
  });

  const customersByPhone = new Map<string, CustomerRecord>();
  for (const complaint of complaints) {
    const phone = complaint.customer_phone.trim();
    const existing = customersByPhone.get(phone);
    if (existing) {
      existing.totalComplaints += 1;
      existing.branches.add(complaint.branch.name);
      if (!existing.birthday && complaint.customer_birth_date) {
        existing.birthday = complaint.customer_birth_date;
      }
      if (!existing.name && complaint.customer_name) {
        existing.name = complaint.customer_name;
      }
      continue;
    }

    customersByPhone.set(phone, {
      key: phone,
      name: complaint.customer_name || "",
      phone,
      birthday: complaint.customer_birth_date,
      totalComplaints: 1,
      latestDate: complaint.created_at,
      latestType: complaintTypeName(complaint.feedback_type),
      branches: new Set([complaint.branch.name])
    });
  }

  const customers = Array.from(customersByPhone.values()).sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime());
  const birthdayCount = customers.filter((customer) => customer.birthday).length;
  const repeatCustomers = customers.filter((customer) => customer.totalComplaints > 1).length;

  return (
    <Shell title="Customer Records" subtitle="Member-style customer list collected from complaint forms." userName={user.name} links={adminLinks}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Customers" value={customers.length} icon={Users} />
        <MetricCard label="Customers With Birthday" value={birthdayCount} icon={Users} />
        <MetricCard label="Repeat Customers" value={repeatCustomers} icon={ClipboardList} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customer / Member Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="py-3 pr-4">Customer Name</th>
                  <th className="py-3 pr-4">Phone Number</th>
                  <th className="py-3 pr-4">Birthday</th>
                  <th className="py-3 pr-4">Next Birthday</th>
                  <th className="py-3 pr-4">Branches</th>
                  <th className="py-3 pr-4">Total Complaints</th>
                  <th className="py-3 pr-4">Latest Complaint Type</th>
                  <th className="py-3 pr-4">Latest Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((customer) => (
                  <tr key={customer.key}>
                    <td className="py-3 pr-4 font-semibold">{customer.name || "-"}</td>
                    <td className="py-3 pr-4">{customer.phone}</td>
                    <td className="py-3 pr-4">{birthdayText(customer.birthday)}</td>
                    <td className="py-3 pr-4">{nextBirthdayText(customer.birthday)}</td>
                    <td className="py-3 pr-4">{Array.from(customer.branches).join(", ")}</td>
                    <td className="py-3 pr-4">{customer.totalComplaints}</td>
                    <td className="py-3 pr-4">{customer.latestType}</td>
                    <td className="py-3 pr-4">{formatDate(customer.latestDate)}</td>
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
