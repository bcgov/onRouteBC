export const IDPS = {
  BCEID: "bceidboth",
  IDIR: "idir",
  BUSINESS_BCEID: "bceidbusiness",
} as const;

export type IDP = (typeof IDPS)[keyof typeof IDPS];
