export const PERMIT_REVIEW_CONTEXTS = {
  APPLY: "APPLY",
  AMEND: "AMEND",
  QUEUE: "QUEUE",
} as const;

export type PermitReviewContext =
  (typeof PERMIT_REVIEW_CONTEXTS)[keyof typeof PERMIT_REVIEW_CONTEXTS];
