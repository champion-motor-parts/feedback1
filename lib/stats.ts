import type { Feedback, User, Branch, FeedbackImage } from "@prisma/client";
import { CASE_STATUSES, COMPLAINT_TYPES, FEEDBACK_TYPES, counterSlotsForBranchName } from "@/lib/constants";

type FeedbackWithJoins = Feedback & {
  staff: User | null;
  branch: Branch;
  images: FeedbackImage[];
};

export function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

type StaffWithBranch = User & { branch?: Branch | null };

type StaffSummarySubject = {
  id: string;
  name: string;
  staff_code: string | null;
  service_area: string | null;
};

function buildRawSummaryRow(staff: StaffSummarySubject, branchName: string, own: FeedbackWithJoins[]) {
  const ratingCounts = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, rating) => {
    acc[rating] = own.filter((feedback) => feedback.rating === rating).length;
    return acc;
  }, {});
  const typeCounts = FEEDBACK_TYPES.reduce<Record<string, number>>((acc, type) => {
    acc[type] = own.filter((feedback) => feedback.feedback_type === type).length;
    return acc;
  }, {});
  const statusCounts = CASE_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = own.filter((feedback) => feedback.status === status).length;
    return acc;
  }, {});

  return {
    staff,
    branchName,
    totalFeedback: own.length,
    averageRating: average(own.map((feedback) => feedback.rating)),
    ratingCounts,
    typeCounts,
    statusCounts
  };
}

export function staffRawSummary(staff: StaffWithBranch[], feedbacks: FeedbackWithJoins[], branches: Branch[] = []) {
  const staffRows = staff.map((person) => {
    const own = feedbacks.filter((feedback) => {
      if (person.service_area === "counter") {
        return (
          feedback.target_type === "counter" &&
          feedback.branch_id === person.branch_id &&
          (feedback.staff_id === person.id || (feedback.target_label || "").toLowerCase() === person.name.toLowerCase())
        );
      }

      return feedback.target_type === "staff" && feedback.staff_id === person.id;
    });
    return buildRawSummaryRow(
      {
        id: `staff-${person.id}`,
        name: person.name,
        staff_code: person.staff_code,
        service_area: person.service_area
      },
      person.branch?.name || "-",
      own
    );
  });

  const counterStaffKeys = new Set(
    staff
      .filter((person) => person.service_area === "counter" && person.branch_id)
      .map((person) => `${person.branch_id}:${person.name.toLowerCase()}`)
  );
  const counterRows = branches.flatMap((branch) =>
    counterSlotsForBranchName(branch.name).filter((slot) => !counterStaffKeys.has(`${branch.id}:${slot.toLowerCase()}`)).map((slot) => {
      const normalizedSlot = slot.toLowerCase();
      const own = feedbacks.filter(
        (feedback) =>
          feedback.target_type === "counter" &&
          feedback.branch_id === branch.id &&
          (feedback.target_label || "").toLowerCase() === normalizedSlot
      );

      return buildRawSummaryRow(
        {
          id: `counter-${branch.id}-${slot}`,
          name: slot,
          staff_code: null,
          service_area: "counter"
        },
        branch.name,
        own
      );
    })
  );

  return [...staffRows, ...counterRows];
}

export function complaintCount(feedbacks: FeedbackWithJoins[]) {
  return feedbacks.filter((feedback) =>
    COMPLAINT_TYPES.includes(feedback.feedback_type as (typeof COMPLAINT_TYPES)[number])
  ).length;
}
