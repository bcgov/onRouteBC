import { areValuesDifferent, doUniqueArraysHaveSameItems } from "../../../common/helpers/equality";
import { Nullable } from "../../../common/types/common";
import { PermitType } from "./PermitType";

export interface PermitLOA {
  loaId: number;
  loaNumber: number;
  companyId: number;
  startDate: string;
  expiryDate?: Nullable<string>;
  loaPermitType: PermitType[];
  powerUnits: string[];
  trailers: string[];
  originalLoaId: number;
  previousLoaId?: Nullable<number>;
}

/**
 * Determine whether or not two permit LOAs have the same details.
 * @param loa1 First permit LOA
 * @param loa2 Second permit LOA
 * @returns Whether or not the two permit LOAs have the same details
 */
export const arePermitLOADetailsEqual = (
  loa1?: Nullable<PermitLOA>,
  loa2?: Nullable<PermitLOA>,
) => {
  if (!loa1 && !loa2) return true;
  if (!loa1 || !loa2) return false;
  
  return loa1.loaId === loa2.loaId
    && loa1.loaNumber === loa2.loaNumber
    && loa1.companyId === loa2.companyId
    && loa1.startDate === loa2.startDate
    && !areValuesDifferent(loa1.expiryDate, loa2.expiryDate)
    && doUniqueArraysHaveSameItems<string>(loa1.loaPermitType, loa2.loaPermitType)
    && doUniqueArraysHaveSameItems<string>(loa1.powerUnits, loa2.powerUnits)
    && doUniqueArraysHaveSameItems<string>(loa1.trailers, loa2.trailers)
    && loa1.originalLoaId === loa2.originalLoaId
    && !areValuesDifferent(loa1.previousLoaId, loa2.previousLoaId);
};
