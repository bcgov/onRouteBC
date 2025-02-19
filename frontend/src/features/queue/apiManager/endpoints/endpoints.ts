import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

const APPLICATIONS_API_BASE = (companyId: number) =>
  `${VEHICLES_URL}/companies/${companyId}/applications`;

export const APPLICATION_QUEUE_API_ROUTES = {
  UPDATE_QUEUE_STATUS: (companyId: number, applicationId: string) =>
    `${APPLICATIONS_API_BASE(companyId)}/${applicationId}/queue/status`,
  CLAIM: (companyId: number, applicationId: string) =>
    `${APPLICATIONS_API_BASE(companyId)}/${applicationId}/queue/assign`,
  SUBMIT_FOR_REVIEW: (companyId: number, applicationId: string) =>
    `${APPLICATIONS_API_BASE(companyId)}/${applicationId}/queue`,
  GET_METADATA: (companyId: number, applicationId: string) =>
    `${APPLICATIONS_API_BASE(companyId)}/${applicationId}/queue/meta-data`,
};
