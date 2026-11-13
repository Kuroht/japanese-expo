import type { SessionPlan } from "../types";
import { estimateMinutes } from "./studySettings";

// Plain count with a singular or plural noun: "1 review", "12 reviews".
function countOf(count: number, noun: string): string {
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}

// The one calm line on the home screen, or null when there is nothing to study.
export function describePlan(plan: SessionPlan): string | null {
  if (plan.reviews.length === 0 && plan.newItems.length === 0) return null;
  const minutes = countOf(estimateMinutes(plan), "minute");
  return `About ${minutes} · ${countOf(plan.reviews.length, "review")} · ${plan.newItems.length} new`;
}
