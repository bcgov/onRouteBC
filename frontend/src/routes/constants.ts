import { Nullable } from "../common/types/common";
import { IDPS } from "../common/types/idp";
import { PermitType } from "../features/permits/types/PermitType";

export const ROUTE_PLACEHOLDERS = {
  PERMIT_ID: "permitId",
  PERMIT_TYPE: "permitType",
};

/**
 * Returns dynamic URI given a prefix segment, dynamic value, and placeholder value.
 * Eg. /permits/1 or /permits/:permitId
 * @param prefixUri URI part before the dynamic portion (eg. /permits)
 * @param placeholderName Name of placeholder (eg. "permitId")
 * @param value Actual dynamic value passed in (eg. "1")
 * @returns Actual dynamic URI containing the dynamic or placeholder value
 */
const DYNAMIC_ROUTE_URI = (
  prefixUri: string,
  placeholderName: string,
  value?: Nullable<string>,
) => {
  if (!value) {
    return `${prefixUri}/:${placeholderName}`;
  }

  return `${prefixUri}/${value}`;
};

export const HOME = "/";

export const ERROR_ROUTES = {
  SUSPENDED: "/suspended",
  UNAUTHORIZED: "/unauthorized",
  UNEXPECTED: "/unexpected-error",
  ISSUANCE: "/issuance-error",
};

// Manage Vehicles
const VEHICLES_ROUTE_BASE = "/manage-vehicles";
export const VEHICLES_DASHBOARD_TABS = {
  POWER_UNIT: "#power-unit",
  TRAILER: "#trailer",
  VEHICLE_CONFIG: "#vehicle-configuration",
};

export const VEHICLES_ROUTES = {
  MANAGE: VEHICLES_ROUTE_BASE,
  ADD_POWER_UNIT: `${VEHICLES_ROUTE_BASE}/add-powerunit`,
  ADD_TRAILER: `${VEHICLES_ROUTE_BASE}/add-trailer`,
  POWER_UNIT_TAB: `${VEHICLES_ROUTE_BASE}${VEHICLES_DASHBOARD_TABS.POWER_UNIT}`,
  TRAILER_TAB: `${VEHICLES_ROUTE_BASE}${VEHICLES_DASHBOARD_TABS.TRAILER}`,
  VEHICLE_CONFIG_TAB: `${VEHICLES_ROUTE_BASE}${VEHICLES_DASHBOARD_TABS.VEHICLE_CONFIG}`,
  POWER_UNIT_DETAILS: `${VEHICLES_ROUTE_BASE}/power-units`,
  TRAILER_DETAILS: `${VEHICLES_ROUTE_BASE}/trailers`,
};

// Manage Profile
const PROFILE_ROUTE_BASE = "/manage-profiles";
export const PROFILE_ROUTES = {
  MANAGE: PROFILE_ROUTE_BASE,
  ADD_USER: `${PROFILE_ROUTE_BASE}/add-user`,
  EDIT_USER: `${PROFILE_ROUTE_BASE}/edit-user`,
  USER_INFO: "/user-info",
};

// Permits
const PERMITS_ROUTE_BASE = "/permits";
export const PERMITS_ROUTES = {
  BASE: PERMITS_ROUTE_BASE,
  SUCCESS: (permitId?: string) =>
    `${DYNAMIC_ROUTE_URI(
      PERMITS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}/success`,
  VOID: (companyId?: string, permitId?: string) =>
    `/companies/${companyId}${DYNAMIC_ROUTE_URI(
      PERMITS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}/void`,
  AMEND: (companyId?: string, permitId?: string) =>
    `/companies/${companyId}${DYNAMIC_ROUTE_URI(
      PERMITS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}/amend`,
};

// Applications
const APPLICATIONS_ROUTE_BASE = `/applications`;
const CREATE_APPLICATION_ROUTE_BASE = "/create-application";

export const APPLICATION_STEPS = {
  HOME: 0,
  DETAILS: 1,
  REVIEW: 2,
  PAY: 3,
} as const;

export type ApplicationStep =
  (typeof APPLICATION_STEPS)[keyof typeof APPLICATION_STEPS];

export const NEW_APPLICATION_SEGMENT = "new";
export const APPLICATIONS_ROUTES = {
  BASE: APPLICATIONS_ROUTE_BASE,
  DETAILS: (permitId?: string) =>
    `${DYNAMIC_ROUTE_URI(
      APPLICATIONS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}`,
  START_APPLICATION: (permitType?: PermitType) =>
    `${DYNAMIC_ROUTE_URI(
      `${CREATE_APPLICATION_ROUTE_BASE}`,
      ROUTE_PLACEHOLDERS.PERMIT_TYPE,
      permitType,
    )}`,
  REVIEW: (permitId?: string) =>
    `${DYNAMIC_ROUTE_URI(
      APPLICATIONS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}/review`,
  PAY: (permitId?: string, failed?: boolean) =>
    `${DYNAMIC_ROUTE_URI(
      APPLICATIONS_ROUTE_BASE,
      ROUTE_PLACEHOLDERS.PERMIT_ID,
      permitId,
    )}/pay${failed ? "?paymentFailed=true" : ""}`,
};

// Create Profile Wizard
export const CREATE_PROFILE_WIZARD_ROUTES = {
  CREATE: "/create-profile",
  WELCOME: "/welcome",
  MIGRATED_CLIENT: "/migrated-client",
  USER_INFO: "/user-info",
};

// IDIR
const IDIR_ROUTE_BASE = `/${IDPS.IDIR}`;
export const IDIR_ROUTES = {
  WELCOME: `${IDIR_ROUTE_BASE}/welcome`,
  SEARCH_RESULTS: `${IDIR_ROUTE_BASE}/search-results`,
  REPORTS: `${IDIR_ROUTE_BASE}/reports`,
  CREATE_COMPANY: `${IDIR_ROUTE_BASE}/create-company`,
};

// Payment
const PAYMENT_ROUTE_BASE = "/payment";
export const PAYMENT_ROUTES = {
  BASE: PAYMENT_ROUTE_BASE,
  PAYMENT_REDIRECT: PAYMENT_ROUTE_BASE,
};

// Settings
const SETTINGS_BASE = "/settings";
export const SETTINGS_ROUTES = {
  MANAGE: SETTINGS_BASE,
};

// OnRoute Webpage Links
export const ONROUTE_WEBPAGE_LINKS = {
  HOME: "https://onroutebc.gov.bc.ca",
  COMMERCIAL_TRANSPORT_PROCEDURES:
    "https://www2.gov.bc.ca/gov/content/transportation/vehicle-safety-enforcement/information-education/commercial-transport-procedures",
  DISCLAIMER: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
  PRIVACY: "https://www2.gov.bc.ca/gov/content/home/privacy",
  ACCESSIBILITY:
    "https://www2.gov.bc.ca/gov/content/home/accessible-government",
  COPYRIGHT: "https://www2.gov.bc.ca/gov/content/home/copyright",
  CONTACT_US: "https://onroutebc.gov.bc.ca",
};
