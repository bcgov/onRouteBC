import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

const APPLICATIONS_API_BASE = (companyId: string | number) =>
  `${VEHICLES_URL}/companies/${companyId}/applications`;

const PERMITS_API_BASE = (companyId: string | number) =>
  `${VEHICLES_URL}/companies/${companyId}/permits`;

const STAFF_PERMIT_API_BASE = `${VEHICLES_URL}/permits`;

const STAFF_APPLICATIONS_API_BASE = `${VEHICLES_URL}/applications`;

export const APPLICATIONS_API_ROUTES = {
  CREATE: (companyId: string | number) => APPLICATIONS_API_BASE(companyId),
  UPDATE: (
    companyId: string | number,
    permitId: string,
  ) => `${APPLICATIONS_API_BASE(companyId)}/${permitId}`,
  GET: (
    companyId: string | number,
    permitId: string,
  ) => `${APPLICATIONS_API_BASE(companyId)}/${permitId}`,
  GET_APPLICATIONS: (companyId: string | number) => APPLICATIONS_API_BASE(companyId),
  DELETE: (companyId: string | number) => APPLICATIONS_API_BASE(companyId),
};

export const STAFF_APPLICATIONS_API_ROUTES = {
  GET: () => STAFF_APPLICATIONS_API_BASE,
};

export const PERMITS_API_ROUTES = {
  BASE: (companyId: string | number) => PERMITS_API_BASE(companyId),
  GET: (companyId: string | number) => PERMITS_API_BASE(companyId),
  ISSUE: (companyId: string | number) => `${APPLICATIONS_API_BASE(companyId)}/issue`,
  AMEND: APPLICATIONS_API_ROUTES.CREATE,
  DOWNLOAD: (companyId: string | number, permitId: string) =>
    `${PERMITS_API_BASE(companyId)}/${permitId}/document`,
  RECEIPT: (companyId: string | number, permitId: string) =>
    `${PERMITS_API_BASE(companyId)}/${permitId}/receipt`,
  VOID: (permitId: string) => `${STAFF_PERMIT_API_BASE}/${permitId}/void`,
  RESEND: (permitId: string) =>
    `${STAFF_PERMIT_API_BASE}/${permitId}/notification`,
};

const PAYMENT_API_BASE = `${VEHICLES_URL}/payment`;

export const PAYMENT_API_ROUTES = {
  START: PAYMENT_API_BASE,
  COMPLETE: PAYMENT_API_BASE,
  GET: PAYMENT_API_BASE,
  PAYMENT_GATEWAY: `payment-gateway`,
};

const CART_API_BASE = (companyId: string | number) =>
  `${VEHICLES_URL}/companies/${companyId}/shopping-cart`;

export const CART_API_ROUTES = {
  GET: (companyId: string | number, fetchAllApplications?: boolean) => {
    if (typeof fetchAllApplications === "undefined") {
      return CART_API_BASE(companyId);
    }

    return `${CART_API_BASE(companyId)}?allApplications=${Boolean(fetchAllApplications)}`;
  },
  ADD: (companyId: string | number) => CART_API_BASE(companyId),
  REMOVE: (companyId: string | number) => CART_API_BASE(companyId),
  COUNT: (companyId: string | number) => `${CART_API_BASE(companyId)}/count`,
};
