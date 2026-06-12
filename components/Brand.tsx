import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/brand-mark.svg" alt="Champion Motor" width={42} height={42} priority />
      {!compact ? (
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ink">Champion Motor</p>
          <p className="text-xs text-neutral-500">Feedback System</p>
        </div>
      ) : null}
    </div>
  );
}
