import type { Feedback, User, Branch, FeedbackImage } from "@prisma/client";
import { CASE_STATUSES, COMPLAINT_TYPES, FEEDBACK_TYPES } from "@/lib/constants";

type FeedbackWithJoins = Feedback & {
  staff: User;
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

export function staffRawSummary(staff: StaffWithBranch[], feedbacks: FeedbackWithJoins[]) {
  return staff.map((person) => {
    const own = feedbacks.filter((feedback) => feedback.staff_id === person.id);
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
      staff: person,
      branchName: person.branch?.name || "-",
      totalFeedback: own.length,
      averageRating: average(own.map((feedback) => feedback.rating)),
      ratingCounts,
      typeCounts,
      statusCounts
    };
  });
}

export function complaintCount(feedbacks: FeedbackWithJoins[]) {
  return feedbacks.filter((feedback) =>
    COMPLAINT_TYPES.includes(feedback.feedback_type as (typeof COMPLAINT_TYPES)[number])
  ).length;
}
