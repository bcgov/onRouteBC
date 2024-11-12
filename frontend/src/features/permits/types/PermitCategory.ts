import {
  NON_RESIDENT_PERMIT_LIST,
  PermitType,
  SINGLE_TRIP_PERMIT_LIST,
  TERM_PERMIT_LIST,
} from "./PermitType";

export const PERMIT_CATEGORIES = {
  TERM: "TERM",
  SINGLE_TRIP: "SINGLE_TRIP",
  NON_RESIDENT: "NON_RESIDENT",
};

export type PermitCategory =
  (typeof PERMIT_CATEGORIES)[keyof typeof PERMIT_CATEGORIES];

/**
 * Returns the name of the permit category.
 * @param permitCategory String that represents the permit category
 * @returns Name of the permit category, or empty string if no mapping exists for permit category
 */
export const getPermitCategoryName = (permitCategory: PermitCategory) => {
  switch (permitCategory) {
    case PERMIT_CATEGORIES.TERM:
      return "Term";
    case PERMIT_CATEGORIES.SINGLE_TRIP:
      return "Single Trip";
    case PERMIT_CATEGORIES.NON_RESIDENT:
      return "Non-Resident";
    default:
      return "";
  }
};

/**
 * Returns the permit category for the given permit type.
 * @param permitType String that represents the permit type
 * @returns Name of the permit category, or empty string if no mapping exists for permit category
 */
export const getPermitCategory = (permitType: PermitType) => {
  if (TERM_PERMIT_LIST.includes(permitType)) {
    return PERMIT_CATEGORIES.TERM;
  }
  if (SINGLE_TRIP_PERMIT_LIST.includes(permitType)) {
    return PERMIT_CATEGORIES.SINGLE_TRIP;
  }
  if (NON_RESIDENT_PERMIT_LIST.includes(permitType)) {
    return PERMIT_CATEGORIES.NON_RESIDENT;
  }
  return "";
};
