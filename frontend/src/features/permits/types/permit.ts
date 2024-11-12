import { ReplaceDayjsWithString } from "./utility";
import { PartialApplication } from "./application";
import { Nullable } from "../../../common/types/common";
import { PermitData } from "./PermitData";
import { PermitType } from "./PermitType";
import { PermitStatus } from "./PermitStatus";
import { PermitApprovalSource } from "./PermitApprovalSource";
import { PermitApplicationOrigin } from "./PermitApplicationOrigin";

/**
 * A partial permit type that consists of all common fields used for a permit.
 * This is an incomplete type and meant to be extended for use.
 */
interface PartialPermit
  extends Omit<
    Required<PartialApplication>,
    "previousRevision" | "comment" | "userGuid" | "documentId"
  > {
  previousRevision?: Nullable<string>;
  comment?: Nullable<string>;
  documentId?: Nullable<string>;
}

/**
 * The request/response object structure to describe the permit object,
 * and used with the permit API.
 *
 * This type is mostly used as a data transfer object (DTO) to pass permit objects
 * between frontend and backend, and also used on the frontend for permit-related logic.
 */
export interface Permit extends PartialPermit {
  permitIssueDateTime?: Nullable<string>;
  createdDateTime: string;
  updatedDateTime: string;
  permitData: ReplaceDayjsWithString<PermitData>;
  issuer?: Nullable<string>;
}

/**
 * This type is used for permit items fetched in a list (eg. Staff search permits).
 */
export interface PermitListItem {
  companyId: number;
  legalName: string;
  alternateName?: Nullable<string>;
  permitId: string;
  originalPermitId: string;
  permitType: PermitType;
  permitNumber: string;
  permitStatus: PermitStatus;
  permitApprovalSource: PermitApprovalSource;
  permitApplicationOrigin: PermitApplicationOrigin;
  startDate: string;
  expiryDate: string;
  permitIssueDateTime: string;
  createdDateTime: string;
  updatedDateTime: string;
  applicant: string;
  issuer?: Nullable<string>;
  unitNumber?: Nullable<string>;
  vin: string;
  plate: string;
}

/**
 * Type for permit response data from fetching permit details.
 */
export interface PermitResponseData extends Permit {}

/**
 * Type used to describe the response object from various actions performed on permits
 * (eg. void/revoke/amend/issue).
 */
export interface PermitsActionResponse {
  success: string[];
  failure: string[];
}

/**
 * Type used to describe the response object for issuing permits.
 */
export interface IssuePermitsResponse extends PermitsActionResponse {}
