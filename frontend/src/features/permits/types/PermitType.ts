import { Nullable } from "../../../common/types/common";
import { getPermitCategory, getPermitCategoryName } from "./PermitCategory";

export const PERMIT_TYPES = {
  /* TERM */
  // Term Oversize
  TROS: "TROS",
  // Term Overweight
  TROW: "TROW",
  // Highway Crossing
  HC: "HC",
  // Axle Overweight

  /* SINGLE TRIP */
  // Extra Provincial Temp Operating Permit
  EPTOP: "EPTOP",
  // Single Trip Overweight
  STOW: "STOW",
  // Single Trip Oversize
  STOS: "STOS",
  // Single Trip Oversize Overweight
  STWS: "STWS",
  // Empty - Single Trip Over Length 27.5
  STOL: "STOL",
  // Rig Move
  RIG: "RIG",
  // Increased GVW
  IGVW: "IGVW",

  /* NON RESIDENT */
  // Quarterly ICBC Basic Insurance (FR)
  QRFR: "QRFR",
  // Quarterly Non-Resident
  QNRBS: "QNRBS",
  // Single Trip ICBC Basic Insurance (FR)
  STFR: "STFR",
  // Single Trip Non-Resident
  NRSCV: "NRSCV",

  /* MOTIVE FUEL USER PERMIT */
  MFP: "MFP",
} as const;

export type PermitType = (typeof PERMIT_TYPES)[keyof typeof PERMIT_TYPES];

export const DEFAULT_PERMIT_TYPE = PERMIT_TYPES.TROS;
export const EMPTY_PERMIT_TYPE_SELECT = "Select";

export const TERM_PERMIT_LIST: PermitType[] = [
  PERMIT_TYPES.TROS,
  PERMIT_TYPES.TROW,
  /* TODO uncomment this when required */
  // PERMIT_TYPES.HC,
];

export const SINGLE_TRIP_PERMIT_LIST: PermitType[] = [
  PERMIT_TYPES.STOL,
  PERMIT_TYPES.EPTOP,
  PERMIT_TYPES.IGVW,
  PERMIT_TYPES.STOS,
  PERMIT_TYPES.STWS,
  PERMIT_TYPES.STOW,
  PERMIT_TYPES.RIG,
];

export const NON_RESIDENT_PERMIT_LIST: PermitType[] = [
  PERMIT_TYPES.QNRBS,
  PERMIT_TYPES.QRFR,
  PERMIT_TYPES.NRSCV,
  PERMIT_TYPES.STFR,
];

/**
 * Returns the name/description of the permit type.
 * @param permitType String (if any) that represents the permit type
 * @returns Name/description of the permit type, or empty string if no mapping exists for permit type
 */
export const getPermitTypeName = (permitType?: Nullable<string>) => {
  switch (permitType) {
    /* TERM */
    case PERMIT_TYPES.TROS:
      return "Term Oversize";
    case PERMIT_TYPES.TROW:
      return "Term Overweight";
    case PERMIT_TYPES.HC:
      return "Highway Crossing";

    /* SINGLE TRIP */
    case PERMIT_TYPES.STOS:
      return "Single Trip Oversize";
    case PERMIT_TYPES.STWS:
      return "Single Trip Overweight Oversize";
    case PERMIT_TYPES.STOW:
      return "Single Trip Over Weight";
    case PERMIT_TYPES.EPTOP:
      return "Extra-Provincial Temporary Operating";
    case PERMIT_TYPES.STOL:
      return "Single Trip Over Length";
    case PERMIT_TYPES.RIG:
      return "Rig Move";
    case PERMIT_TYPES.IGVW:
      return "Increased GVW";

    /* NON-RESIDENT */
    case PERMIT_TYPES.NRSCV:
      return "Single Trip Non-Resident";
    case PERMIT_TYPES.QNRBS:
      return "Quarterly Non-Resident";
    case PERMIT_TYPES.QRFR:
      return "Quarterly ICBC Basic Insurance (FR)";
    case PERMIT_TYPES.STFR:
      return "Single Trip ICBC Basic Insurance (FR)";

    /* MOTIVE FUEL USER PERMIT */
    case PERMIT_TYPES.MFP:
      return "Motive Fuel User Permit";

    default:
      return "";
  }
};

/**
 * Returns the shortened name/description of the permit type.
 * @param permitType String (if any) that represents the permit type
 * @returns Short name/description of the permit type, or empty string if no mapping exists for permit type
 */
export const getPermitTypeShortName = (permitType?: Nullable<string>) => {
  switch (permitType) {
    /* TERM */
    case PERMIT_TYPES.TROS:
      return "Oversize";
    case PERMIT_TYPES.TROW:
      return "Overweight";
    case PERMIT_TYPES.HC:
      return "Highway Crossing";

    /* SINGLE TRIP */
    case PERMIT_TYPES.EPTOP:
      return "Extra-Provincial Temporary Operating Permit";
    case PERMIT_TYPES.STOW:
      return "Overweight";
    case PERMIT_TYPES.STOS:
      return "Oversize";
    case PERMIT_TYPES.STWS:
      return "Oversized Overweight";
    case PERMIT_TYPES.STOL:
      return "Empty - Length Over 27.5 m";
    case PERMIT_TYPES.RIG:
      return "Rig Move";
    case PERMIT_TYPES.IGVW:
      return "Increased GVW";

    /* NON RESIDENT */
    case PERMIT_TYPES.QRFR:
      return "Quarterly ICBC Basic Insurance (FR)";
    case PERMIT_TYPES.QNRBS:
      return "Quarterly";
    case PERMIT_TYPES.STFR:
      return "Single Trip ICBC Basic Insurance (FR)";
    case PERMIT_TYPES.NRSCV:
      return "Single Trip";

    /* MOTIVE FUEL USER PERMIT */
    case PERMIT_TYPES.MFP:
      return "Motive Fuel User Permit";

    default:
      return "";
  }
};

/**
 * Gets formatted Permit Type name as "PermitCategory > PermitType". Used in the Select Permit Type dropdown
 * @param permitType Permit type (eg. TROS, STOS, etc)
 * @returns formatted display text for the permit category type
 */
export const getFormattedPermitTypeName = (permitType: PermitType) => {
  if (permitType === PERMIT_TYPES.MFP) {
    return getPermitTypeName(PERMIT_TYPES.MFP);
  }
  return `${getPermitCategoryName(getPermitCategory(permitType))} > ${getPermitTypeShortName(permitType)}`;
};

/**
 * Determines whether or not a string represents a valid permit type.
 * @param permitType string representing permit type value, if it exists (eg. tros, trow, etc)
 * @returns true if string is a valid permit type, or false otherwise
 */
export const isPermitTypeValid = (permitType?: Nullable<string>) => {
  return (
    permitType &&
    (Object.values(PERMIT_TYPES) as string[]).includes(permitType.toUpperCase())
  );
};

/**
 * Determine whether or not a permit type is considered a term permit.
 * @param permitType Type of permit
 * @returns Whether or not the permit of that type is considered a term permit
 */
export const isTermPermitType = (permitType: PermitType) => {
  return permitType === PERMIT_TYPES.TROS || permitType === PERMIT_TYPES.TROW;
};
