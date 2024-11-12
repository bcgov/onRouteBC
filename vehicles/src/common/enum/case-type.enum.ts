export const CaseType = {
  DEFAULT: 'DEFAULT',
} as const;

export type CaseType = (typeof CaseType)[keyof typeof CaseType];
