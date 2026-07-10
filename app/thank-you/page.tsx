import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Brand } from "@/components/Brand";
import { CopyReviewButton } from "@/components/CopyReviewButton";
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
  const isCompliment = params.kind === "compliment";
  const copy = {
    en: {
      title: "Thank you. We received your complaint.",
      complimentTitle: "Thank you for your compliment.",
      body: "Our team hears you and will review your case soon.",
      complimentBody: "We appreciate your kind words. You can also support our team with a Google Maps review.",
      caseId: "Case ID",
      whatsapp: "Contact Us on WhatsApp",
      copyReview: "Copy My Compliment",
      copiedReview: "Copied",
      googleReview: "Leave a Google Maps Review",
      another: "Submit Another Complaint"
    },
    ms: {
      title: "Terima kasih. Aduan anda telah diterima.",
      complimentTitle: "Terima kasih atas pujian anda.",
      body: "Pasukan kami akan menyemak kes anda secepat mungkin.",
      complimentBody: "Kami amat menghargai kata-kata baik anda. Anda juga boleh menyokong team kami melalui Google Maps review.",
      caseId: "Nombor Kes",
      whatsapp: "Hubungi Kami di WhatsApp",
      copyReview: "Salin Pujian Saya",
      copiedReview: "Sudah Disalin",
      googleReview: "Beri Review di Google Maps",
      another: "Hantar Aduan Lain"
    }
  }[language];
  const whatsappUrl = process.env.COMPANY_WHATSAPP_URL || "https://wa.me/601116177703";
  const googleReviewUrl = "https://www.google.com/search?q=Champion+Motor+Parts+Sdn+Bhd+(HQ)&ludocid=2962366439113891171#lrd=0x31da6d80651cb9ed:0x291c7094c1ec1d63,3,,,";

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
          <h1 className="mt-5 text-2xl font-bold text-ink">{isCompliment ? copy.complimentTitle : copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {isCompliment ? copy.complimentBody : copy.body}
          </p>
          <div className="mt-5 rounded-md border border-line bg-neutral-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{copy.caseId}</p>
            <p className="mt-1 text-xl font-bold text-ink">{caseId}</p>
          </div>
          <div className="mt-6 grid gap-3">
            {isCompliment ? (
              <>
                <CopyReviewButton label={copy.copyReview} copiedLabel={copy.copiedReview} />
                <a className={buttonClass()} href={googleReviewUrl} target="_blank" rel="noreferrer">
                  <MapPin className="h-4 w-4" />
                  {copy.googleReview}
                </a>
              </>
            ) : null}
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
