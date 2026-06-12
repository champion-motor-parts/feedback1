import { LoginPanel } from "@/components/LoginPanel";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <LoginPanel
      role="admin"
      title="Admin Login"
      subtitle="View all feedback, charts, raw staff data, QR links, and exports."
      defaultEmail="admin@championmotor.test"
      defaultPassword="Admin123!"
      hasError={params.error === "invalid"}
    />
  );
}
