import { PermitCondition } from "../types/PermitCondition";
import {
  BASE_DAYS_IN_YEAR,
  TERM_PERMIT_DURATION_OPTIONS,
  TERM_PERMIT_MIN_DURATION,
  TERM_DURATION_INTERVAL_DAYS,
} from "./constants";

export const TROS_ELIGIBLE_VEHICLE_SUBTYPES = [
  "BOOSTER",
  "DOLLIES",
  "EXPANDO",
  "FEBGHSE",
  "FECVYER",
  "FEDRMMX",
  "FEPNYTR",
  "FESEMTR",
  "FEWHELR",
  "FLOATTR",
  "FULLLTL",
  "HIBOEXP",
  "HIBOFLT",
  "JEEPSRG",
  "LOGDGLG",
  "LOGFULL",
  "LOGNTAC",
  "LOGOWBK",
  "LOGSMEM",
  "LOGTNDM",
  "LOGTRIX",
  "ODTRLEX",
  "OGOSFDT",
  "PLATFRM",
  "POLETRL",
  "PONYTRL",
  "REDIMIX",
  "SEMITRL",
  "STBTRAN",
  "STCHIPS",
  "STCRANE",
  "STINGAT",
  "STLOGNG",
  "STNTSHC",
  "STREEFR",
  "STSDBDK",
  "STSTNGR",
  "STWHELR",
  "STWIDWH",
  "BUSTRLR",
  "CONCRET",
  "DDCKBUS",
  "GRADERS",
  "LOGGING",
  "LOGOFFH",
  "LWBTRCT",
  "OGBEDTK",
  "OGOILSW",
  "PICKRTT",
  "PLOWBLD",
  "REGTRCK",
  "STINGER",
  "TOWVEHC",
  "TRKTRAC",
];

export const TROS_CONDITIONS: PermitCondition[] = [
  {
    description: "General Permit Conditions",
    condition: "CVSE-1000",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251",
    checked: true,
    disabled: true,
  },
  {
    description: "Permit Scope and Limitation",
    condition: "CVSE-1070",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261",
    checked: true,
    disabled: true,
  },
  {
    description: "Supplement for Structures",
    condition: "CVSE-1000S",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1255",
    checked: false,
  },
  {
    description: "Log Permit Conditions",
    condition: "CVSE-1000L",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1250",
    checked: false,
  },
  {
    description: "Routes - Woods Chips & Residual",
    condition: "CVSE-1012",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1259",
    checked: false,
  },
  {
    description: "Restricted Routes for Hauling Wood on Wide Bunks",
    condition: "CVSE-1013",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1254",
    checked: false,
  }
];

export const MANDATORY_TROS_CONDITIONS: PermitCondition[] = 
  TROS_CONDITIONS.filter(
    ({ condition }: PermitCondition) =>
      condition === "CVSE-1000" || condition === "CVSE-1070"
  );

export const MIN_TROS_DURATION = TERM_PERMIT_MIN_DURATION;
export const MAX_TROS_DURATION = BASE_DAYS_IN_YEAR;
export const TROS_DURATION_OPTIONS = [...TERM_PERMIT_DURATION_OPTIONS];
export const TROS_DURATION_INTERVAL_DAYS = TERM_DURATION_INTERVAL_DAYS;
