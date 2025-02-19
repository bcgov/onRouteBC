export const CASE_STATUS_TYPES = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
} as const;

export type CaseStatus =
  (typeof CASE_STATUS_TYPES)[keyof typeof CASE_STATUS_TYPES];
