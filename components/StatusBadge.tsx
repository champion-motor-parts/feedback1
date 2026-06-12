import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Resolved"
      ? "green"
      : status === "Escalated"
        ? "amber"
        : status === "In Progress"
          ? "blue"
          : "neutral";

  return <Badge tone={tone}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge tone={priority === "High" ? "amber" : "neutral"}>{priority}</Badge>;
}
