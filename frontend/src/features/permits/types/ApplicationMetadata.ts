import { CaseStatus } from "./CaseStatus";

export interface ApplicationMetadata {
  caseId: number;
  caseType: "DEFAULT";
  caseStatusType: CaseStatus;
  assignedUser: string;
  applicationId: string;
  applicationNumber: string;
}
