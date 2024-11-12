export const CaseActivityType = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type CaseActivityType =
  (typeof CaseActivityType)[keyof typeof CaseActivityType];
