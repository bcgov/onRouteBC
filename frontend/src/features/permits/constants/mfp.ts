import { PermitCondition } from "../types/PermitCondition";

export const MFP_CONDITIONS: PermitCondition[] = [
  {
    description: "Motive Fuel Tax Act",
    condition: "MV4001",
    conditionLink: "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1539",
    checked: true,
    disabled: true
  },
];

export const MANDATORY_MFP_CONDITIONS: PermitCondition[] = [...MFP_CONDITIONS];

export const MIN_MFP_DURATION = 1;
export const MAX_MFP_DURATION = 7;
export const MFP_DURATION_OPTIONS = [
  { value: MIN_MFP_DURATION, label: "1 Day" },
  { value: 2, label: "2 Days" },
  { value: 3, label: "3 Days" },
  { value: 4, label: "4 Days" },
  { value: 5, label: "5 Days" },
  { value: 6, label: "6 Days" },
  { value: MAX_MFP_DURATION, label: "7 Days" },
];

export const MFP_DURATION_INTERVAL_DAYS = 1;
