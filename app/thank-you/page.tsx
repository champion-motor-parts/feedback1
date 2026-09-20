import Link from "next/link";
import type { CSSProperties } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import { Brand } from "@/components/Brand";
import { CopyReviewButton } from "@/components/CopyReviewButton";
import { WhatsAppFollowupButton } from "@/components/WhatsAppFollowupButton";
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
      whatsappFollowup: "Send Complaint via WhatsApp",
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
      whatsappFollowup: "Hantar Aduan melalui WhatsApp",
      copyReview: "Salin Pujian Saya",
      copiedReview: "Sudah Disalin",
      googleReview: "Beri Review di Google Maps",
      another: "Hantar Aduan Lain"
    }
  }[language];
  const whatsappNumber = "601121891142";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const googleReviewUrl = "https://www.google.com/search?q=Champion+Motor+Parts+Sdn+Bhd+(HQ)&ludocid=2962366439113891171#lrd=0x31da6d80651cb9ed:0x291c7094c1ec1d63,3,,,";
  const confetti = [
    ["8%", "#f59e0b", "7px", "13px", "2.8s", "0ms", "32px", "220deg"],
    ["16%", "#16a34a", "8px", "8px", "3.2s", "120ms", "-24px", "310deg"],
    ["24%", "#2563eb", "6px", "14px", "2.7s", "60ms", "42px", "260deg"],
    ["36%", "#f59e0b", "9px", "9px", "3.4s", "180ms", "-36px", "330deg"],
    ["48%", "#d97706", "7px", "15px", "3s", "30ms", "28px", "280deg"],
    ["60%", "#0f766e", "8px", "8px", "3.3s", "150ms", "-44px", "300deg"],
    ["72%", "#9333ea", "6px", "13px", "2.9s", "90ms", "34px", "240deg"],
    ["84%", "#dc2626", "8px", "10px", "3.1s", "210ms", "-28px", "320deg"],
    ["92%", "#475569", "6px", "12px", "2.6s", "40ms", "22px", "250deg"]
  ];
  const fireworks = [
    ["18%", "22%", "#f59e0b", "120ms"],
    ["78%", "20%", "#16a34a", "220ms"],
    ["50%", "13%", "#2563eb", "340ms"]
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-4 py-8">
      <div className="showroom-grid pointer-events-none fixed inset-0 opacity-40" aria-hidden="true" />
      <div className="celebration-layer" aria-hidden="true">
        {confetti.map(([x, c, w, h, d, delay, drift, r], index) => (
          <span
            key={`confetti-${index}`}
            className="celebration-piece"
            style={{
              "--x": x,
              "--c": c,
              "--w": w,
              "--h": h,
              "--d": d,
              "--delay": delay,
              "--drift": drift,
              "--r": r
            } as CSSProperties}
          />
        ))}
        {fireworks.map(([x, y, c, delay], index) => (
          <span
            key={`firework-${index}`}
            className="firework"
            style={{ "--x": x, "--y": y, "--c": c, "--delay": delay } as CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-enter">
        <div className="mb-5 animate-enter rounded-lg border border-white/10 bg-white p-4 shadow-soft">
          <Brand />
        </div>
        <Card className="animate-enter-delayed p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-brand-50 text-brand-700 shadow-soft">
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
            {isCompliment ? (
              <a className={buttonClass()} href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                {copy.whatsapp}
              </a>
            ) : (
              <WhatsAppFollowupButton
                caseId={caseId}
                language={language}
                label={copy.whatsappFollowup}
                phoneNumber={whatsappNumber}
              />
            )}
            <Link href={`/feedback?lang=${language}`} className={buttonClass({ variant: "secondary" })}>
              {copy.another}
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
