export const THIRD_PARTY_LIABILITIES = {
  DANGEROUS_GOODS: "DANGEROUS_GOODS",
  GENERAL_GOODS: "GENERAL_GOODS",
} as const;

export type ThirdPartyLiability
  = typeof THIRD_PARTY_LIABILITIES[keyof typeof THIRD_PARTY_LIABILITIES];

export const DEFAULT_THIRD_PARTY_LIABILITY = THIRD_PARTY_LIABILITIES.GENERAL_GOODS;

export const thirdPartyLiabilityFullName = (thirdPartyLiability: ThirdPartyLiability) => {
  return thirdPartyLiability === THIRD_PARTY_LIABILITIES.DANGEROUS_GOODS
    ? "Dangerous Goods"
    : "General Goods";
};
