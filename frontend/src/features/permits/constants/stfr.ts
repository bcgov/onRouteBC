import { PermitCondition } from "../types/PermitCondition";

export const STFR_CONDITIONS: PermitCondition[] = [
  {
    description: "Insurance Certificate Conditions",
    condition: "APV96",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1547",
    checked: true,
    disabled: true
  },
];

export const MANDATORY_STFR_CONDITIONS: PermitCondition[] = [...STFR_CONDITIONS];

export const MIN_STFR_DURATION = 1;
export const MAX_STFR_DURATION = 30;
export const STFR_DURATION_OPTIONS = [
  { value: MIN_STFR_DURATION, label: "1 Day" },
  { value: 2, label: "2 Days" },
  { value: 3, label: "3 Days" },
  { value: 4, label: "4 Days" },
  { value: 5, label: "5 Days" },
  { value: 6, label: "6 Days" },
  { value: 7, label: "7 Days" },
  { value: 8, label: "8 Days" },
  { value: 9, label: "9 Days" },
  { value: 10, label: "10 Days" },
  { value: 11, label: "11 Days" },
  { value: 12, label: "12 Days" },
  { value: 13, label: "13 Days" },
  { value: 14, label: "14 Days" },
  { value: 15, label: "15 Days" },
  { value: 16, label: "16 Days" },
  { value: 17, label: "17 Days" },
  { value: 18, label: "18 Days" },
  { value: 19, label: "19 Days" },
  { value: 20, label: "20 Days" },
  { value: 21, label: "21 Days" },
  { value: 22, label: "22 Days" },
  { value: 23, label: "23 Days" },
  { value: 24, label: "24 Days" },
  { value: 25, label: "25 Days" },
  { value: 26, label: "26 Days" },
  { value: 27, label: "27 Days" },
  { value: 28, label: "28 Days" },
  { value: 29, label: "29 Days" },
  { value: MAX_STFR_DURATION, label: "30 Days" },
];

export const STFR_DURATION_INTERVAL_DAYS = 1;
