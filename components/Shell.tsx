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
    <div className="relative min-h-screen overflow-hidden bg-[#080807]">
      <div className="showroom-grid pointer-events-none fixed inset-0 opacity-30" aria-hidden="true" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#080807] px-5 py-6 lg:block">
        <div className="py-2">
          <Brand compact />
        </div>
        <nav className="mt-8 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#11100e]/95 px-4 py-3 shadow-sm backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="w-fit py-1 lg:hidden">
                <Brand compact />
              </div>
              <h1 className="mt-2 truncate text-xl font-black text-white lg:mt-0 lg:text-2xl">{title}</h1>
              <p className="text-sm text-stone-400">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden text-sm font-semibold text-stone-300 md:block">{userName}</p>
              <form action={logoutAction}>
                <Button variant="secondary" size="icon" title="Log out" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="relative px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
