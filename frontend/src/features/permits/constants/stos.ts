import { PermitCondition } from "../types/PermitCondition";

export const STOS_CONDITIONS: PermitCondition[] = [
  {
    description: "General Permit Conditions",
    condition: "CVSE-1000",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251",
    checked: true,
    disabled: true
  },
  {
    description: "Permit Scope and Limitation",
    condition: "CVSE-1070",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261",
    checked: true,
    disabled: true
  },
  {
    description: "Routes Pre-Approved for 5.0 m OAW",
    condition: "CVSE-1001",
    conditionLink: "",
    checked: false
  },
  {
    description: "General Permit Conditions to 6.1 m in the Peace River Area",
    condition: "CVSE-1002",
    conditionLink: "",
    checked: false
  },
  {
    description: "East-West Overheight Corridors in the Lower Mainland",
    condition: "CVSE-1010",
    conditionLink: "",
    checked: false
  },
  {
    description: "Routes - Woods Chips & Residual",
    condition: "CVSE-1012",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1259",
    checked: false
  },
  {
    description: "Restricted Routes for Hauling Wood on Wide Bunks",
    condition: "CVSE-1013",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1254",
    checked: false
  },
];

export const MANDATORY_STOS_CONDITIONS: PermitCondition[] = 
  STOS_CONDITIONS.filter(
    ({ condition }: PermitCondition) =>
      condition === "CVSE-1000" || condition === "CVSE-1070"
  );

export const MIN_STOS_DURATION = 1;
export const MAX_STOS_DURATION = 7;
export const STOS_DURATION_OPTIONS = [
  { value: MIN_STOS_DURATION, label: "1 Day" },
  { value: 2, label: "2 Days" },
  { value: 3, label: "3 Days" },
  { value: 4, label: "4 Days" },
  { value: 5, label: "5 Days" },
  { value: 6, label: "6 Days" },
  { value: MAX_STOS_DURATION, label: "7 Days" },
];

export const STOS_DURATION_INTERVAL_DAYS = 1;
