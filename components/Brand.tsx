import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src="/champion-logo.jpeg"
        alt="Champion Motor Parts Sdn Bhd"
        width={compact ? 190 : 220}
        height={compact ? 28 : 38}
        priority
        className="h-auto max-w-[190px] object-contain md:max-w-[220px]"
      />
      {!compact ? (
        <div className="hidden border-l border-line pl-3 sm:block">
          <p className="text-sm font-bold uppercase tracking-wide text-ink">Feedback System</p>
          <p className="text-xs text-neutral-500">Customer Service</p>
        </div>
      ) : null}
    </div>
  );
}
