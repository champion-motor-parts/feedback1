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

export function FeedbackForm({
  branches,
  staff,
  initialBranchId,
  initialStaffId
}: {
  branches: Branch[];
  staff: StaffOption[];
  initialBranchId?: number;
  initialStaffId?: number;
}) {
  const initialStaff = staff.find((person) => person.id === initialStaffId);
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

  useEffect(() => {
    if (!filteredStaff.some((person) => person.id === staffId)) {
      setStaffId(filteredStaff[0]?.id || 0);
    }
  }, [filteredStaff, staffId]);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!malaysiaPhoneIsValid(phone)) {
      setError("Please enter a valid Malaysia phone number, e.g. 01xxxxxxxx or +601xxxxxxxx.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));

    const photos = formData.getAll("photos").filter((item) => item instanceof File && item.size > 0);
    if (photos.length > 3) {
      setError("Please upload up to 3 photos only.");
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
        setError(payload.error || "Unable to submit feedback. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = `/thank-you?caseId=${encodeURIComponent(payload.caseId)}`;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-5">
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <Brand compact />
          <span className="rounded-md bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            QR Form
          </span>
        </div>

        <section className="mb-5 rounded-lg bg-ink p-5 text-white shadow-soft">
          <p className="text-sm font-semibold text-brand-100">Champion Motor Customer Feedback</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight">Tell us what happened.</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-200">
            Your feedback helps us improve our service.
          </p>
        </section>

        <Card className="p-5">
          <form className="space-y-5" onSubmit={submitFeedback}>
            <Field label="Branch / Outlet">
              <Select name="branchId" value={branchId} onChange={(event) => setBranchId(Number(event.target.value))}>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Staff / Service Person">
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
                      className={`focus-ring min-h-44 rounded-lg border bg-white p-3 text-left transition ${
                        isSelected
                          ? "border-brand-600 shadow-soft ring-2 ring-brand-100"
                          : "border-line hover:border-neutral-300"
                      }`}
                    >
                      <img
                        src={person.image_url || "/staff/default.svg"}
                        alt={person.name}
                        className="mx-auto h-20 w-20 rounded-full border border-line bg-neutral-50 object-cover"
                      />
                      <span className="mt-3 block text-center text-sm font-bold text-ink">{person.name}</span>
                      <span className="mt-1 block text-center text-xs text-neutral-500">
                        {person.position || "Staff"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedStaff?.branch ? (
                <p className="text-xs text-neutral-500">Assigned branch: {selectedStaff.branch.name}</p>
              ) : null}
            </Field>

            <Field label="Feedback Type">
              <Select name="feedbackType" required>
                {FEEDBACK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Rating">
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
                    title={`${value} - ${RATING_LABELS[value]}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500">{rating} = {RATING_LABELS[rating]}</p>
            </Field>

            <Field label="Comment / Details">
              <Textarea
                name="comment"
                required
                placeholder="Please describe what happened or tell us how we can improve."
              />
            </Field>

            <Field label="Upload Photo" hint="Optional. Up to 3 images, 3 MB each.">
              <label className="focus-ring flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-600">
                <Camera className="mb-2 h-6 w-6 text-brand-700" />
                Add product, installation, or warranty photos
                <input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" />
              </label>
            </Field>

            <Field label="Customer Name">
              <Input name="customerName" placeholder="Optional" />
            </Field>

            <Field label="Phone Number">
              <Input
                name="customerPhone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01xxxxxxxx or +601xxxxxxxx"
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
              Submit Feedback
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
