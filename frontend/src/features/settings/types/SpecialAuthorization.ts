import { Nullable } from "../../../common/types/common";

export const NO_FEE_PERMIT_TYPES = {
  GOV_PROV_CAN: 1,
  MUNICIPAL_CAN: 2,
  DISTRICT_OUT_BC: 3,
  GOV_USA: 4,
  GOV_PROV_USA: 5,
} as const;

export type NoFeePermitType = typeof NO_FEE_PERMIT_TYPES[keyof typeof NO_FEE_PERMIT_TYPES];

export const noFeePermitTypeDescription = (noFeePermitType: NoFeePermitType) => {
  switch (noFeePermitType) {
    case NO_FEE_PERMIT_TYPES.GOV_PROV_CAN:
      return "The government of Canada or any province or territory";
    case NO_FEE_PERMIT_TYPES.MUNICIPAL_CAN:
      return "A municipality";
    case NO_FEE_PERMIT_TYPES.DISTRICT_OUT_BC:
      return "A school district outside of BC (S. 9 Commercial Transport Act)";
    case NO_FEE_PERMIT_TYPES.GOV_USA:
      return "The government of the United States of America";
    default:
      return "The government of any state or county in the United States of America";
  }
};

export interface LOA {
  loaNumber: string;
  startDate: string;
  expiryDate?: Nullable<string>;
  documentId: number;
};
