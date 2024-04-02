/* eslint-disable @typescript-eslint/no-unused-vars */
import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

const PERMITS_API_BASE = `${VEHICLES_URL}/permits`;
const APPLICATIONS_API_BASE = `${PERMITS_API_BASE}/applications`;

const APPLICATIONS_API_BASE_2 = (companyId: string) =>
  `${VEHICLES_URL}/company/${companyId}/applications`;

const APPLICATIONS_API_BASE_22 = (_s: any, companyId: string) => {
  return `${VEHICLES_URL}/company/${companyId}/applications`;
};

const PERMITS_API_BASE_2 = (companyId: string) =>
  `${VEHICLES_URL}/company/${companyId}/permits`;

export const APPLICATIONS_API_ROUTES = {
  CREATE: (companyId: string) => APPLICATIONS_API_BASE_22`${companyId}`,
  UPDATE: (companyId: string) => APPLICATIONS_API_BASE_2(companyId),
  GET: (companyId: string) => APPLICATIONS_API_BASE_2(companyId),
  DELETE: (companyId: string) => APPLICATIONS_API_BASE_2(companyId),
};

export const PERMITS_API_ROUTES = {
  BASE: (companyId: string) => PERMITS_API_BASE_2(companyId),
  GET: (companyId: string) => PERMITS_API_BASE_2(companyId),
  ISSUE: (companyId: string) => `${APPLICATIONS_API_BASE_2(companyId)}/issue`,
  AMEND: APPLICATIONS_API_ROUTES.CREATE,
  DOWNLOAD: (companyId: string, permitId: string) =>
    `${PERMITS_API_BASE_2(companyId)}/${permitId}/document`,
  RECEIPT: (companyId: string, permitId: string) =>
    `${PERMITS_API_BASE_2(companyId)}/${permitId}/receipt`,
  VOID: `void`,
  RESEND: `notification`,
};

const PAYMENT_API_BASE = `${VEHICLES_URL}/payment`;

export const PAYMENT_API_ROUTES = {
  START: PAYMENT_API_BASE,
  COMPLETE: PAYMENT_API_BASE,
  GET: PAYMENT_API_BASE,
  PAYMENT_GATEWAY: `payment-gateway`,
};
