"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

type Language = "en" | "ms";

function whatsappLink(phoneNumber: string, caseId: string, language: Language, comment: string) {
  const message = language === "ms"
    ? `Hai Champion Motor Parts, saya ingin membuat susulan tentang aduan saya.\n\nNombor kes: ${caseId}\nKomen: ${comment}`
    : `Hi Champion Motor Parts, I would like to follow up on my complaint.\n\nCase ID: ${caseId}\nComment: ${comment}`;

  return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
}

export function WhatsAppFollowupButton({
  caseId,
  language,
  label,
  phoneNumber
}: {
  caseId: string;
  language: Language;
  label: string;
  phoneNumber: string;
}) {
  const [href, setHref] = useState(() => whatsappLink(phoneNumber, caseId, language, "-"));

  useEffect(() => {
    const comment = window.sessionStorage.getItem(`champion:submissionComment:${caseId}`) || "-";
    setHref(whatsappLink(phoneNumber, caseId, language, comment));
  }, [caseId, language, phoneNumber]);

  return (
    <a href={href} target="_blank" rel="noreferrer" className={buttonClass()}>
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
