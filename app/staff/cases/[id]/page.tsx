import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { updateCaseAction } from "@/app/actions";
import { Shell, type ShellLink } from "@/components/Shell";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/field";
import { CASE_STATUSES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, ratingStars } from "@/lib/utils";

const staffLinks: ShellLink[] = [
  { href: "/staff", label: "My Cases", icon: ClipboardList }
];

export default async function StaffCaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("staff");
  const { id } = await params;
  const feedback = await prisma.feedback.findUnique({
    where: { id: Number(id) },
    include: {
      branch: true,
      staff: true,
      images: true,
      notes: { include: { user: true }, orderBy: { created_at: "desc" } }
    }
  });

  if (!feedback || feedback.staff_id !== user.id) redirect("/staff");

  return (
    <Shell title={feedback.case_id} subtitle="Case detail and status update." userName={user.name} links={staffLinks}>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Case Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Customer Name" value={feedback.customer_name || "-"} />
              <Detail label="Phone Number" value={feedback.customer_phone} />
              <Detail label="Branch" value={feedback.branch.name} />
              <Detail label="Staff Name" value={feedback.staff.name} />
              <Detail label="Feedback Type" value={feedback.feedback_type} />
              <Detail label="Rating" value={ratingStars(feedback.rating)} />
              <Detail label="Created Date" value={formatDateTime(feedback.created_at)} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current Status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={feedback.status} />
                  <PriorityBadge priority={feedback.priority} />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Comment</p>
              <p className="mt-2 rounded-md bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">{feedback.comment}</p>
            </div>
            {feedback.images.length ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Uploaded Photos</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {feedback.images.map((image) => (
                    <a key={image.id} href={image.image_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-line">
                      <img src={image.image_url} alt="Uploaded feedback" className="h-36 w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Update Case</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateCaseAction} className="space-y-4">
                <input type="hidden" name="feedbackId" value={feedback.id} />
                <input type="hidden" name="returnTo" value={`/staff/cases/${feedback.id}`} />
                <Field label="Status">
                  <Select name="status" defaultValue={feedback.status}>
                    {CASE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Internal Note">
                  <Textarea name="note" placeholder="Customer contacted. Waiting for replacement part." />
                </Field>
                <Button type="submit" className="w-full">Update Case</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedback.notes.length ? (
                feedback.notes.map((note) => (
                  <div key={note.id} className="rounded-md bg-neutral-50 p-3">
                    <p className="text-sm text-neutral-700">{note.note}</p>
                    <p className="mt-2 text-xs text-neutral-500">
                      {note.user.name} - {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No notes yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
