import { BarChart3, Camera, ClipboardList, Download, Gauge, LineChart, ListFilter } from "lucide-react";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Shell, type ShellLink } from "@/components/Shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackLink } from "@/lib/utils";

const adminLinks: ShellLink[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardList },
  { href: "/admin/staff-data", label: "Staff Data", icon: LineChart },
  { href: "/admin/staff", label: "Staff", icon: ListFilter },
  { href: "/admin/branches", label: "Branches", icon: Gauge },
  { href: "/admin/qr", label: "QR Codes", icon: Camera }
];

export default async function QRPage() {
  const user = await requireUser("admin");
  const [staff, branches] = await Promise.all([
    prisma.user.findMany({ where: { role: "staff", status: "Active" }, include: { branch: true }, orderBy: { id: "asc" } }),
    prisma.branch.findMany({ where: { status: "Active" }, orderBy: { id: "asc" } })
  ]);

  return (
    <Shell title="QR Codes" subtitle="Generate and download feedback QR codes." userName={user.name} links={adminLinks}>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Staff QR Codes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {staff.map((person) => {
              const link = feedbackLink({ staffId: person.id });
              return (
                <div key={person.id} className="rounded-lg border border-line p-4">
                  <img src={`/api/qr?type=staff&id=${person.id}`} alt={`${person.name} QR code`} className="mx-auto h-40 w-40" />
                  <h2 className="mt-3 font-bold text-ink">{person.name}</h2>
                  <p className="text-sm text-neutral-600">{person.position || "Staff"} - {person.branch?.name || "-"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyLinkButton value={link} />
                    <a href={`/api/qr?type=staff&id=${person.id}&download=1`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                      <Download className="h-4 w-4" />
                      PNG
                    </a>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch QR Codes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {branches.map((branch) => {
              const link = feedbackLink({ branchId: branch.id });
              return (
                <div key={branch.id} className="rounded-lg border border-line p-4">
                  <img src={`/api/qr?type=branch&id=${branch.id}`} alt={`${branch.name} QR code`} className="mx-auto h-40 w-40" />
                  <h2 className="mt-3 font-bold text-ink">{branch.name}</h2>
                  <p className="text-sm text-neutral-600">{branch.phone || "No phone"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyLinkButton value={link} />
                    <a href={`/api/qr?type=branch&id=${branch.id}&download=1`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                      <Download className="h-4 w-4" />
                      PNG
                    </a>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
