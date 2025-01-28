import { PermitCondition } from "../types/PermitCondition";
import {
  BASE_DAYS_IN_YEAR,
  TERM_PERMIT_DURATION_OPTIONS,
  TERM_PERMIT_MIN_DURATION, 
  TERM_DURATION_INTERVAL_DAYS,
} from "./constants";

export const TROW_ELIGIBLE_VEHICLE_SUBTYPES = [
  "DOLLIES",
  "FEBGHSE",
  "FECVYER",
  "FEDRMMX",
  "FEPNYTR",
  "FESEMTR",
  "FEWHELR",
  "REDIMIX",
  "CONCRET",
  "CRAFTAT",
  "CRAFTMB",
  "GRADERS",
  "MUNFITR",
  "OGOILSW",
  "OGSERVC",
  "OGSRRAH",
  "PICKRTT",
  "TOWVEHC",
];

export const TROW_CONDITIONS: PermitCondition[] = [
  {
    description: "Permit Scope and Limitation",
    condition: "CVSE-1070",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261",
    checked: true,
    disabled: true,
  },
  {
    description: "Highways and Restrictive Load Limits",
    condition: "CVSE-1011",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1258",
    checked: true,
    disabled: true,
  },
];

export const MANDATORY_TROW_CONDITIONS: PermitCondition[] = [...TROW_CONDITIONS];
export const MIN_TROW_DURATION = TERM_PERMIT_MIN_DURATION;
export const MAX_TROW_DURATION = BASE_DAYS_IN_YEAR;
export const TROW_DURATION_OPTIONS = [...TERM_PERMIT_DURATION_OPTIONS];
export const TROW_DURATION_INTERVAL_DAYS = TERM_DURATION_INTERVAL_DAYS;
