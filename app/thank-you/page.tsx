import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Brand } from "@/components/Brand";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const caseId = params.caseId || "FB-000001";
  const language = params.lang === "ms" ? "ms" : "en";
  const copy = {
    en: {
      title: "Thank you for your feedback.",
      body: "Our team will review your case soon.",
      caseId: "Case ID",
      whatsapp: "Contact Us on WhatsApp",
      another: "Submit Another Feedback"
    },
    ms: {
      title: "Terima kasih atas maklum balas anda.",
      body: "Pasukan kami akan menyemak kes anda secepat mungkin.",
      caseId: "Nombor Kes",
      whatsapp: "Hubungi Kami di WhatsApp",
      another: "Hantar Maklum Balas Lain"
    }
  }[language];
  const whatsappUrl = process.env.COMPANY_WHATSAPP_URL || "https://wa.me/60123456789";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f5] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5">
          <Brand />
        </div>
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <MessageCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {copy.body}
          </p>
          <div className="mt-5 rounded-md border border-line bg-neutral-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{copy.caseId}</p>
            <p className="mt-1 text-xl font-bold text-ink">{caseId}</p>
          </div>
          <div className="mt-6 grid gap-3">
            <a className={buttonClass()} href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              {copy.whatsapp}
            </a>
            <Link href={`/feedback?lang=${language}`} className={buttonClass({ variant: "secondary" })}>
              {copy.another}
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
