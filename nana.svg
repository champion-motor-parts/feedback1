"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function CopyReviewButton({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [review, setReview] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReview(window.sessionStorage.getItem("champion:lastCompliment") || "");
  }, []);

  if (!review) return null;

  async function copyReview() {
    await navigator.clipboard.writeText(review);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copyReview} className={buttonClass({ variant: "secondary" })}>
      <Copy className="h-4 w-4" />
      {copied ? copiedLabel : label}
    </button>
  );
}
