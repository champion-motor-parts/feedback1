import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";

export type ShellLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function Shell({
  title,
  subtitle,
  userName,
  links,
  children
}: {
  title: string;
  subtitle: string;
  userName: string;
  links: ShellLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="lg:hidden">
                <Brand compact />
              </div>
              <h1 className="mt-2 truncate text-xl font-bold text-ink lg:mt-0 lg:text-2xl">{title}</h1>
              <p className="text-sm text-neutral-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden text-sm font-semibold text-neutral-700 md:block">{userName}</p>
              <form action={logoutAction}>
                <Button variant="secondary" size="icon" title="Log out" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
