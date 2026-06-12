import { BarChart3, Ban, Building2, Camera, ClipboardList, Download, Gauge, LineChart, ListFilter, Save } from "lucide-react";
import { deactivateBranchAction, saveBranchAction } from "@/app/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Shell, type ShellLink } from "@/components/Shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { STAFF_STATUS } from "@/lib/constants";
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

export default async function BranchManagementPage() {
  const user = await requireUser("admin");
  const branches = await prisma.branch.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <Shell title="Branch Management" subtitle="Maintain branch records and branch QR feedback links." userName={user.name} links={adminLinks}>
      <Card>
        <CardHeader>
          <CardTitle>Add Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveBranchAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input name="name" placeholder="Branch Name" required />
            <Input name="address" placeholder="Address" />
            <Input name="phone" placeholder="Phone" />
            <Select name="status" defaultValue="Active">
              {STAFF_STATUS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            <button type="submit" className={buttonClass()}>
              <Building2 className="h-4 w-4" />
              Add Branch
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Branch Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {branches.map((branch) => {
            const link = feedbackLink({ branchId: branch.id });
            return (
              <div key={branch.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-ink">{branch.name}</h2>
                      <Badge tone={branch.status === "Active" ? "green" : "neutral"}>{branch.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">{branch.address || "No address"} - {branch.phone || "No phone"}</p>
                    <p className="mt-1 text-xs text-neutral-500">Created {formatDate(branch.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyLinkButton value={link} />
                    <a href={`/api/qr?type=branch&id=${branch.id}&download=1`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                      <Download className="h-4 w-4" />
                      QR PNG
                    </a>
                    <form action={deactivateBranchAction}>
                      <input type="hidden" name="id" value={branch.id} />
                      <button className={buttonClass({ variant: "danger", size: "sm" })} type="submit">
                        <Ban className="h-4 w-4" />
                        Deactivate
                      </button>
                    </form>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-700">Edit branch record</summary>
                  <form action={saveBranchAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <input type="hidden" name="id" value={branch.id} />
                    <Input name="name" defaultValue={branch.name} required />
                    <Input name="address" defaultValue={branch.address || ""} />
                    <Input name="phone" defaultValue={branch.phone || ""} />
                    <Select name="status" defaultValue={branch.status}>
                      {STAFF_STATUS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
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
