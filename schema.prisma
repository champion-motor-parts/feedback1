import { LoginPanel } from "@/components/LoginPanel";

export default async function StaffLoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <LoginPanel
      role="staff"
      title="Staff Login"
      subtitle="Handle customer cases assigned to your staff account."
      defaultEmail="akak@championmotor.test"
      defaultPassword="Staff123!"
      hasError={params.error === "invalid"}
    />
  );
}
