import { BarChart3, Ban, Camera, ClipboardList, Download, Gauge, LineChart, ListFilter, Save, UserPlus } from "lucide-react";
import { deactivateStaffAction, saveStaffAction } from "@/app/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Shell, type ShellLink } from "@/components/Shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { FEEDBACK_SERVICE_AREA_LABELS, FEEDBACK_SERVICE_AREAS, STAFF_STATUS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackLink, formatDate } from "@/lib/utils";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardList },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

const errorMessages: Record<string, string> = {
  missing: "Please fill in staff name, email, and branch.",
  email: "This email is already used by another account.",
  status: "Invalid staff status.",
  area: "Invalid staff area."
};

export default async function StaffManagementPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser("admin");
  const params = await searchParams;
  const [staff, branches] = await Promise.all([
    prisma.user.findMany({
      where: { role: "staff", status: "Active" },
      include: { branch: true },
      orderBy: { id: "asc" }
    }),
    prisma.branch.findMany({ where: { status: "Active" }, orderBy: { id: "asc" } })
  ]);

  return (
    <Shell title="Staff Management" subtitle="Maintain staff records and staff QR feedback links." userName={user.name} links={adminLinks}>
      <Card>
        <CardHeader>
          <CardTitle>Add Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessages[params.error] || "Unable to save staff. Please check the details and try again."}
            </div>
          ) : null}
          <form action={saveStaffAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
            <Input name="name" placeholder="Staff Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="phone" placeholder="Phone" />
            <Input name="staffCode" placeholder="Staff Code" />
            <Input name="position" placeholder="Position" />
            <Select name="serviceArea" defaultValue="showroom">
              {FEEDBACK_SERVICE_AREAS.map((area) => (
                <option key={area} value={area}>{FEEDBACK_SERVICE_AREA_LABELS[area]}</option>
              ))}
            </Select>
            <Input name="imageUrl" placeholder="Photo URL" />
            <Select name="branchId" required defaultValue={branches[0]?.id || ""}>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </Select>
            <Input name="password" type="password" placeholder="Password (default Staff123!)" />
            <button type="submit" className={buttonClass()}>
              <UserPlus className="h-4 w-4" />
              Add Staff
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Staff Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {staff.map((person) => {
            const link = feedbackLink({ staffId: person.id });
            return (
              <div key={person.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      src={person.image_url || "/staff/default.svg"}
                      alt={person.name}
                      className="h-16 w-16 shrink-0 rounded-full border border-line bg-neutral-50 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-ink">{person.name}</h2>
                        <Badge tone={person.status === "Active" ? "green" : "neutral"}>{person.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-neutral-600">
                        {person.staff_code || "No code"} - {person.position || "Staff"} - {person.service_area ? FEEDBACK_SERVICE_AREA_LABELS[person.service_area as keyof typeof FEEDBACK_SERVICE_AREA_LABELS] : "No area"} - {person.branch?.name || "No branch"} - {person.email}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">Created {formatDate(person.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyLinkButton value={link} />
                    <a href={`/api/qr?type=staff&id=${person.id}&download=1`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                      <Download className="h-4 w-4" />
                      QR PNG
                    </a>
                    <form action={deactivateStaffAction}>
                      <input type="hidden" name="id" value={person.id} />
                      <button className={buttonClass({ variant: "danger", size: "sm" })} type="submit">
                        <Ban className="h-4 w-4" />
                        Deactivate
                      </button>
                    </form>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-700">Edit staff record</summary>
                  <form action={saveStaffAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-8">
                    <input type="hidden" name="id" value={person.id} />
                    <Input name="name" defaultValue={person.name} required />
                    <Input name="email" type="email" defaultValue={person.email} required />
                    <Input name="phone" defaultValue={person.phone || ""} />
                    <Input name="staffCode" defaultValue={person.staff_code || ""} />
                    <Input name="position" defaultValue={person.position || ""} />
                    <Select name="serviceArea" defaultValue={person.service_area || "showroom"}>
                      {FEEDBACK_SERVICE_AREAS.map((area) => (
                        <option key={area} value={area}>{FEEDBACK_SERVICE_AREA_LABELS[area]}</option>
                      ))}
                    </Select>
                    <Input name="imageUrl" defaultValue={person.image_url || ""} placeholder="Photo URL" />
                    <Select name="branchId" defaultValue={person.branch_id || branches[0]?.id || ""}>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </Select>
                    <Select name="status" defaultValue={person.status}>
                      {STAFF_STATUS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                    <Input name="password" type="password" placeholder="New password optional" />
                    <button type="submit" className={buttonClass()}>
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </form>
                </details>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </Shell>
  );
}
