import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  const imageClass = compact
    ? "h-auto w-[260px] max-w-full object-contain sm:w-[300px]"
    : "h-auto max-w-[190px] object-contain md:max-w-[220px]";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src="/champion-logo.jpeg"
        alt="Champion Motor Parts Sdn Bhd"
        width={compact ? 300 : 220}
        height={compact ? 48 : 38}
        priority
        className={imageClass}
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
