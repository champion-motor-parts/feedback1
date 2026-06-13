import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "@/components/FeedbackForm";

export default async function FeedbackPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [branches, staff] = await Promise.all([
    prisma.branch.findMany({
      where: { status: "Active" },
      orderBy: { id: "asc" }
    }),
    prisma.user.findMany({
      where: { role: "staff", status: "Active" },
      include: { branch: true },
      orderBy: { id: "asc" }
    })
  ]);

  return (
    <FeedbackForm
      branches={branches}
      staff={staff}
      initialBranchId={Number(params.branchId || 0) || undefined}
      initialStaffId={Number(params.staffId || 0) || undefined}
      initialLanguage={params.lang === "ms" ? "ms" : "en"}
      initialTargetType={params.target === "counter" || params.target === "store" ? params.target : "staff"}
    />
  );
}
