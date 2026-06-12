"use client";

import { useEffect, useMemo, useState } from "react";
import type { Branch, User } from "@prisma/client";
import { Camera, Loader2, Send, Star } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FEEDBACK_TYPES, RATING_LABELS } from "@/lib/constants";
import { malaysiaPhoneIsValid } from "@/lib/utils";

type StaffOption = User & { branch: Branch | null };
type Language = "en" | "ms";

const copy = {
  en: {
    qrForm: "QR Form",
    eyebrow: "Champion Motor Customer Feedback",
    title: "Tell us what happened.",
    intro: "Your feedback helps us improve our service.",
    branch: "Branch / Outlet",
    staff: "Staff / Service Person",
    assignedBranch: "Assigned branch",
    feedbackType: "Feedback Type",
    rating: "Rating",
    comment: "Comment / Details",
    commentPlaceholder: "Please describe what happened or tell us how we can improve.",
    uploadPhoto: "Upload Photo",
    uploadHint: "Optional. Up to 3 images, 3 MB each.",
    uploadCta: "Add product, installation, or warranty photos",
    customerName: "Customer Name",
    optional: "Optional",
    phoneNumber: "Phone Number",
    phonePlaceholder: "01xxxxxxxx or +601xxxxxxxx",
    phoneError: "Please enter a valid Malaysia phone number, e.g. 01xxxxxxxx or +601xxxxxxxx.",
    photoError: "Please upload up to 3 photos only.",
    submitError: "Unable to submit feedback. Please try again.",
    networkError: "Network error. Please try again.",
    submit: "Submit Feedback",
    staffFallback: "Staff"
  },
  ms: {
    qrForm: "Borang QR",
    eyebrow: "Maklum Balas Pelanggan Champion Motor",
    title: "Kongsi pengalaman anda.",
    intro: "Maklum balas anda membantu kami memperbaiki servis.",
    branch: "Cawangan / Outlet",
    staff: "Staf / Orang Servis",
    assignedBranch: "Cawangan",
    feedbackType: "Jenis Maklum Balas",
    rating: "Penilaian",
    comment: "Komen / Butiran",
    commentPlaceholder: "Sila terangkan apa yang berlaku atau bagaimana kami boleh membantu.",
    uploadPhoto: "Muat Naik Gambar",
    uploadHint: "Tidak wajib. Maksimum 3 gambar, 3 MB setiap satu.",
    uploadCta: "Tambah gambar produk, pemasangan, atau warranty",
    customerName: "Nama Pelanggan",
    optional: "Tidak wajib",
    phoneNumber: "Nombor Telefon",
    phonePlaceholder: "01xxxxxxxx atau +601xxxxxxxx",
    phoneError: "Sila masukkan nombor telefon Malaysia yang sah, contoh 01xxxxxxxx atau +601xxxxxxxx.",
    photoError: "Sila muat naik maksimum 3 gambar sahaja.",
    submitError: "Maklum balas tidak dapat dihantar. Sila cuba lagi.",
    networkError: "Masalah rangkaian. Sila cuba lagi.",
    submit: "Hantar Maklum Balas",
    staffFallback: "Staf"
  }
} satisfies Record<Language, Record<string, string>>;

const feedbackTypeLabels: Record<Language, Record<string, string>> = {
  en: Object.fromEntries(FEEDBACK_TYPES.map((type) => [type, type])),
  ms: {
    "Product Issue": "Isu Produk",
    "Installation Issue": "Isu Pemasangan",
    "Service Attitude": "Sikap Layanan",
    "Slow Reply": "Lambat Membalas",
    "Wrong Item": "Barang Salah",
    "Warranty / Claim": "Warranty / Tuntutan",
    Compliment: "Pujian",
    "General Feedback": "Maklum Balas Umum",
    Other: "Lain-lain"
  }
};

const ratingLabels: Record<Language, Record<number, string>> = {
  en: RATING_LABELS,
  ms: {
    1: "Sangat Teruk",
    2: "Teruk",
    3: "Biasa",
    4: "Baik",
    5: "Sangat Baik"
  }
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function FeedbackForm({
  branches,
  staff,
  initialBranchId,
  initialStaffId,
  initialLanguage = "en"
}: {
  branches: Branch[];
  staff: StaffOption[];
  initialBranchId?: number;
  initialStaffId?: number;
  initialLanguage?: Language;
}) {
  const initialStaff = staff.find((person) => person.id === initialStaffId);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [rating, setRating] = useState(5);
  const [branchId, setBranchId] = useState(initialBranchId || initialStaff?.branch_id || branches[0]?.id || 0);
  const [staffId, setStaffId] = useState(initialStaffId || staff[0]?.id || 0);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const filteredStaff = useMemo(() => {
    const matchingStaff = staff.filter((person) => person.branch_id === branchId);
    return matchingStaff.length ? matchingStaff : staff;
  }, [branchId, staff]);

  const selectedStaff = useMemo(
    () => staff.find((person) => person.id === staffId),
    [staff, staffId]
  );

  const t = copy[language];
  const ratingText = ratingLabels[language];

  useEffect(() => {
    if (!filteredStaff.some((person) => person.id === staffId)) {
      setStaffId(filteredStaff[0]?.id || 0);
    }
  }, [filteredStaff, staffId]);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!malaysiaPhoneIsValid(phone)) {
      setError(t.phoneError);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));

    const photos = formData.getAll("photos").filter((item) => item instanceof File && item.size > 0);
    if (photos.length > 3) {
      setError(t.photoError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || t.submitError);
        setSubmitting(false);
        return;
      }
      window.location.href = `/thank-you?caseId=${encodeURIComponent(payload.caseId)}&lang=${language}`;
    } catch {
      setError(t.networkError);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f5] px-4 py-5">
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Brand compact />
          <div className="flex rounded-md border border-line bg-white p-1 shadow-sm" aria-label="Language">
            {(["en", "ms"] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
                className={`h-8 rounded px-3 text-xs font-bold transition ${
                  language === code ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {code === "en" ? "EN" : "BM"}
              </button>
            ))}
          </div>
        </div>

        <section className="mb-5 overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="border-t-4 border-brand-500 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-100">{t.eyebrow}</p>
              <span className="shrink-0 rounded-md bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {t.qrForm}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight">{t.title}</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-200">{t.intro}</p>
          </div>
        </section>

        <Card className="p-5">
          <form className="space-y-5" onSubmit={submitFeedback}>
            <Field label={t.branch}>
              <Select name="branchId" value={branchId} onChange={(event) => setBranchId(Number(event.target.value))}>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.staff}>
              <input type="hidden" name="staffId" value={staffId} />
              <div className="grid grid-cols-2 gap-3">
                {filteredStaff.map((person) => {
                  const isSelected = person.id === staffId;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      aria-pressed={isSelected}
                      title={`${person.name} - ${person.position || "Staff"}`}
                      onClick={() => setStaffId(person.id)}
                      className={`focus-ring min-h-52 rounded-lg border bg-white p-3 text-left transition ${
                        isSelected
                          ? "border-brand-600 shadow-soft ring-2 ring-brand-100"
                          : "border-line hover:border-neutral-300"
                      }`}
                    >
                      {person.image_url ? (
                        <img
                          src={person.image_url}
                          alt={person.name}
                          className="mx-auto h-20 w-20 rounded-full border border-line bg-neutral-50 object-cover"
                        />
                      ) : (
                        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-lg font-black text-brand-700">
                          {initials(person.name)}
                        </span>
                      )}
                      <span className="mt-3 block min-h-12 break-words text-center text-xs font-bold leading-4 text-ink sm:text-sm">
                        {person.name}
                      </span>
                      <span className="mt-1 block text-center text-xs text-neutral-500">
                        {person.position || t.staffFallback}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedStaff?.branch ? (
                <p className="text-xs text-neutral-500">{t.assignedBranch}: {selectedStaff.branch.name}</p>
              ) : null}
            </Field>

            <Field label={t.feedbackType}>
              <Select name="feedbackType" required>
                {FEEDBACK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {feedbackTypeLabels[language][type]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.rating}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`focus-ring flex h-14 flex-col items-center justify-center rounded-md border text-sm font-bold transition ${
                      rating === value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-line bg-white text-neutral-600"
                    }`}
                    onClick={() => setRating(value)}
                    title={`${value} - ${ratingText[value]}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500">{rating} = {ratingText[rating]}</p>
            </Field>

            <Field label={t.comment}>
              <Textarea
                name="comment"
                required
                placeholder={t.commentPlaceholder}
              />
            </Field>

            <Field label={t.uploadPhoto} hint={t.uploadHint}>
              <label className="focus-ring flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-600">
                <Camera className="mb-2 h-6 w-6 text-brand-700" />
                {t.uploadCta}
                <input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" />
              </label>
            </Field>

            <Field label={t.customerName}>
              <Input name="customerName" placeholder={t.optional} />
            </Field>

            <Field label={t.phoneNumber}>
              <Input
                name="customerPhone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t.phonePlaceholder}
                inputMode="tel"
              />
            </Field>

            {error ? (
              <div className="rounded-md bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t.submit}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
