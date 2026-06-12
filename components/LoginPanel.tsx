import { LockKeyhole, Mail } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { loginAction } from "@/app/actions";

export function LoginPanel({
  role,
  title,
  subtitle,
  defaultEmail,
  defaultPassword,
  hasError
}: {
  role: "admin" | "staff";
  title: string;
  subtitle: string;
  defaultEmail: string;
  defaultPassword: string;
  hasError: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5">
          <Brand />
        </div>
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{subtitle}</p>

          <form action={loginAction} className="mt-6 space-y-4">
            <input type="hidden" name="role" value={role} />
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                <Input className="pl-9" name="email" type="email" defaultValue={defaultEmail} required />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                <Input className="pl-9" name="password" type="password" defaultValue={defaultPassword} required />
              </div>
            </Field>
            {hasError ? (
              <div className="rounded-md bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                Invalid email or password.
              </div>
            ) : null}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
