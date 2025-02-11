import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFileLines,
  faHome,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";

export const NAV_BUTTON_TYPES = {
  HOME: "home",
  REPORT: "report",
  BFCT: "bfct",
} as const;

export type NavButtonType =
  (typeof NAV_BUTTON_TYPES)[keyof typeof NAV_BUTTON_TYPES];

export const getNavButtonTitle = (type: NavButtonType): string => {
  if (type === NAV_BUTTON_TYPES.HOME) {
    return "Home";
  }

  if (type === NAV_BUTTON_TYPES.REPORT) {
    return "Report";
  }

  return "Bridge Formula Calculation Tool";
};

export const getIcon = (type: NavButtonType): IconDefinition => {
  if (type === NAV_BUTTON_TYPES.HOME) {
    return faHome;
  }

  if (type === NAV_BUTTON_TYPES.REPORT) {
    return faFileLines;
  }

  return faTruckMoving;
};
