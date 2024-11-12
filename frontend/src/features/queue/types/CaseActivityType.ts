export const APPLICATION_QUEUE_STATUSES = {
  PENDING_REVIEW: "PENDING_REVIEW",
  IN_REVIEW: "IN_REVIEW",
  CLOSED: "CLOSED",
} as const;

export type ApplicationQueueStatus =
  (typeof APPLICATION_QUEUE_STATUSES)[keyof typeof APPLICATION_QUEUE_STATUSES];

export const CASE_ACTIVITY_TYPES = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
};
export type CaseActivityType =
  (typeof CASE_ACTIVITY_TYPES)[keyof typeof CASE_ACTIVITY_TYPES];
