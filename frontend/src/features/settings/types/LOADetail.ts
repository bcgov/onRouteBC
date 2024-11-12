import { Nullable } from "../../../common/types/common";
import { PermitType } from "../../permits/types/PermitType";

export interface LOADetail {
  loaId: number;
  loaNumber: number;
  companyId: number;
  startDate: string;
  expiryDate?: Nullable<string>;
  documentId: string;
  fileName: string;
  loaPermitType: PermitType[];
  comment?: Nullable<string>;
  powerUnits: string[];
  trailers: string[];
  originalLoaId: number;
  previousLoaId?: Nullable<number>;
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
