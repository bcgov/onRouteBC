import { Nullable, RequiredOrNull } from "../../../common/types/common";
import { PermitType } from "../../permits/types/PermitType";

export const NO_FEE_PERMIT_TYPES = {
  CA_GOVT: "CA_GOVT",
  MUNICIPALITY: "MUNICIPALITY",
  SCHOOL: "SCHOOL",
  USA_FEDERAL_GOVT: "USA_FEDERAL_GOVT",
  OTHER_USA_GOVT: "OTHER_USA_GOVT",
} as const;

export type NoFeePermitType = typeof NO_FEE_PERMIT_TYPES[keyof typeof NO_FEE_PERMIT_TYPES];

export const DEFAULT_NO_FEE_PERMIT_TYPE = NO_FEE_PERMIT_TYPES.CA_GOVT;

export const noFeePermitTypeDescription = (noFeePermitType: NoFeePermitType) => {
  switch (noFeePermitType) {
    case NO_FEE_PERMIT_TYPES.CA_GOVT:
      return "The government of Canada or any province or territory";
    case NO_FEE_PERMIT_TYPES.MUNICIPALITY:
      return "A municipality";
    case NO_FEE_PERMIT_TYPES.SCHOOL:
      return "A school district outside of BC (S. 9 Commercial Transport Act)";
    case NO_FEE_PERMIT_TYPES.USA_FEDERAL_GOVT:
      return "The government of the United States of America";
    default:
      return "The government of any state or county in the United States of America";
  }
};

export interface LOADetail {
  loaId: string;
  loaNumber: string;
  companyId: number;
  startDate: string;
  expiryDate?: Nullable<string>;
  documentId: string;
  fileName: string;
  loaPermitType: PermitType[];
  comment?: Nullable<string>;
  powerUnits: string[];
  trailers: string[];
}

export interface CreateLOARequestData {
  startDate: string;
  expiryDate?: Nullable<string>;
  loaPermitType: PermitType[];
  // document: Buffer;
  comment?: Nullable<string>;
  powerUnits: string[];
  trailers: string[];
}

export interface UpdateLOARequestData {
  startDate: string;
  expiryDate?: Nullable<string>;
  loaPermitType: PermitType[];
  // document?: Buffer;
  comment?: Nullable<string>;
  powerUnits: string[];
  trailers: string[];
}

export interface SpecialAuthorizationData {
  companyId: number;
  specialAuthId: number;
  isLcvAllowed: boolean;
  noFeeType: RequiredOrNull<NoFeePermitType>;
}
