import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

const SETTINGS_API_BASE = `${VEHICLES_URL}/companies`;
const SUSPEND_API_BASE = SETTINGS_API_BASE;
const SPECIAL_AUTH_API_BASE = SETTINGS_API_BASE;

export const SUSPEND_API_ROUTES = {
  HISTORY: (companyId: number) => `${SUSPEND_API_BASE}/${companyId}/suspend`,
  SUSPEND: (companyId: number) => `${SUSPEND_API_BASE}/${companyId}/suspend`,
};

export const SPECIAL_AUTH_API_ROUTES = {
  SPECIAL_AUTH: {
    GET: (companyId: number | string) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/special-auths`,
    UPDATE_NO_FEE: (companyId: number | string) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/special-auths/no-fee`,
    UPDATE_LCV: (companyId: number | string) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/special-auths/lcv`,
  },
  LOA: {
    ALL: (companyId: number | string, expired: boolean) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas?expired=${expired}`,
    DETAIL: (companyId: number | string, loaId: number) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas/${loaId}`,
    CREATE: (companyId: number | string) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas`,
    UPDATE: (companyId: number | string, loaId: number) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas/${loaId}`,
    REMOVE: (companyId: number | string, loaId: number) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas/${loaId}`,
    DOWNLOAD: (companyId: number | string, loaId: number) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas/${loaId}/documents?download=proxy`,
    REMOVE_DOCUMENT: (companyId: number | string, loaId: number) =>
      `${SPECIAL_AUTH_API_BASE}/${companyId}/loas/${loaId}/documents`,
  },
};

const CREDIT_ACCOUNT_API_BASE = `${VEHICLES_URL}/companies`;

export const CREDIT_ACCOUNT_API_ROUTES = {
  CREATE_CREDIT_ACCOUNT: (companyId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts`,
  GET_CREDIT_ACCOUNT_META_DATA: (companyId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts`,
  GET_CREDIT_ACCOUNT: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}`,
  GET_CREDIT_ACCOUNT_HISTORY: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/history`,
  GET_CREDIT_ACCOUNT_LIMITS: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/limits`,
  GET_COMPANY: (clientNumber: string) =>
    `${CREDIT_ACCOUNT_API_BASE}/companies?page=1&take=1&clientNumber=${clientNumber}`,
  GET_CREDIT_ACCOUNT_USERS: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/credit-account-users?includeAccountHolder=true`,
  ADD_CREDIT_ACCOUNT_USER: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/credit-account-users`,
  REMOVE_CREDIT_ACCOUNT_USER: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/credit-account-users`,
  UPDATE_ACCOUNT_STATUS: (companyId: number, creditAccountId: number) =>
    `${CREDIT_ACCOUNT_API_BASE}/${companyId}/credit-accounts/${creditAccountId}/status`,
};
