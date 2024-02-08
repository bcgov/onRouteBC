import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

const PERMITS_API_BASE = `${VEHICLES_URL}/permits`;
const APPLICATIONS_API_BASE = `${PERMITS_API_BASE}/applications`;

export const APPLICATIONS_API_ROUTES = {
  CREATE: APPLICATIONS_API_BASE,
  UPDATE: APPLICATIONS_API_BASE,
  GET: APPLICATIONS_API_BASE,
  STATUS: `${APPLICATIONS_API_BASE}/status`,
};

export const PERMITS_API_ROUTES = {
  BASE: PERMITS_API_BASE,
  GET: PERMITS_API_BASE,
  ISSUE: `${APPLICATIONS_API_BASE}/issue`,
  AMEND: APPLICATIONS_API_ROUTES.CREATE,
  DOWNLOAD: `pdf?download=proxy`,
  RECEIPT: `receipt`,
  VOID: `void`,
};

const PAYMENT_API_BASE = `${VEHICLES_URL}/payment`;

export const PAYMENT_API_ROUTES = {
  START: PAYMENT_API_BASE,
  COMPLETE: PAYMENT_API_BASE,
  PAYMENT_GATEWAY: `payment-gateway`,
};
