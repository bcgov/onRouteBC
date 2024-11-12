import dayjs, { Dayjs } from "dayjs";

import {
  BASE_DAYS_IN_YEAR,
  TERM_DURATION_INTERVAL_DAYS,
} from "../constants/constants";
import { PERMIT_TYPES, PermitType } from "../types/PermitType";
import { getExpiryDate } from "./permitState";
import { getMostRecentExpiryFromLOAs } from "./permitLOA";
import { PermitLOA } from "../types/PermitLOA";
import {
  MAX_TROS_DURATION,
  MIN_TROS_DURATION,
  TROS_DURATION_INTERVAL_DAYS,
  TROS_DURATION_OPTIONS,
} from "../constants/tros";

import {
  MAX_TROW_DURATION,
  MIN_TROW_DURATION,
  TROW_DURATION_INTERVAL_DAYS,
  TROW_DURATION_OPTIONS,
} from "../constants/trow";

/**
 * Get list of selectable duration options for a given permit type.
 * @param permitType Permit type to get duration options for
 * @returns List of selectable duration options for the given permit type
 */
export const durationOptionsForPermitType = (permitType: PermitType) => {
  if (permitType === PERMIT_TYPES.TROS) return TROS_DURATION_OPTIONS;
  if (permitType === PERMIT_TYPES.TROW) return TROW_DURATION_OPTIONS;
  return [];
};

/**
 * Get the minimum allowable duration for a given permit type.
 * @param permitType Permit type to get min duration for
 * @returns Mininum allowable duration for the permit type
 */
export const minDurationForPermitType = (permitType: PermitType) => {
  if (permitType === PERMIT_TYPES.TROS) return MIN_TROS_DURATION;
  if (permitType === PERMIT_TYPES.TROW) return MIN_TROW_DURATION;
  return 0;
};

/**
 * Get the maximum allowable duration for a given permit type.
 * @param permitType Permit type to get max duration for
 * @returns Maxinum allowable duration for the permit type
 */
export const maxDurationForPermitType = (permitType: PermitType) => {
  if (permitType === PERMIT_TYPES.TROS) return MAX_TROS_DURATION;
  if (permitType === PERMIT_TYPES.TROW) return MAX_TROW_DURATION;
  return BASE_DAYS_IN_YEAR;
};

/**
 * Get the duration interval (in days) for a given permit type.
 * @param permitType Permit type to get duration interval for
 * @returns Number of days as duration interval for the permit type.
 */
export const getDurationIntervalDays = (permitType: PermitType) => {
  switch (permitType) {
    case PERMIT_TYPES.TROW:
      return TROW_DURATION_INTERVAL_DAYS;
    case PERMIT_TYPES.TROS:
      return TROS_DURATION_INTERVAL_DAYS;
    default:
      return TERM_DURATION_INTERVAL_DAYS; // This needs to be updated once more permit types are added
  }
};

/**
 * Get the minimum permit expiry date.
 * @param permitType Permit type
 * @param startDate Expected start date of the permit
 * @returns The earliest date that the permit will expire on
 */
export const getMinPermitExpiryDate = (
  permitType: PermitType,
  startDate: Dayjs,
) => {
  const minDuration = minDurationForPermitType(permitType);
  return getExpiryDate(startDate, minDuration);
};

/**
 * Get available duration options for a permit based on selected LOAs and start date.
 * @param fullDurationOptions Full duration select options for a permit
 * @param selectedLOAs Selected LOAs for a permit
 * @param startDate Start date for a permit
 * @returns Updated available duration select options
 */
export const getAvailableDurationOptions = (
  fullDurationOptions: {
    value: number;
    label: string;
  }[],
  selectedLOAs: PermitLOA[],
  startDate: Dayjs,
) => {
  const mostRecentLOAExpiry = getMostRecentExpiryFromLOAs(selectedLOAs);
  if (!mostRecentLOAExpiry) return fullDurationOptions;

  return fullDurationOptions.filter(
    ({ value: durationDays }) =>
      !mostRecentLOAExpiry.isBefore(getExpiryDate(startDate, durationDays)),
  );
};

/**
 * Update permit duration if durations options change.
 * Selected duration must be between min allowable permit duration and max available duration in the options.
 * @param permitType Permit type
 * @param currentDuration Currently selected duration for the permit
 * @param durationOptions Available list of selectable duration options for the permit
 * @returns Current permit duration if valid, or updated duration if no longer valid
 */
export const handleUpdateDurationIfNeeded = (
  permitType: PermitType,
  currentDuration: number,
  durationOptions: {
    value: number;
    label: string;
  }[],
) => {
  const minAllowableDuration = minDurationForPermitType(permitType);
  const maxDurationInOptions = Math.max(
    ...durationOptions.map((durationOption) => durationOption.value),
  );

  if (currentDuration > maxDurationInOptions) {
    if (maxDurationInOptions < minAllowableDuration) {
      return minAllowableDuration;
    }
    return maxDurationInOptions;
  }

  return currentDuration;
};

/**
 * Determine if start date or expiry date of permit applicationare in the past
 * @param startDate Start date of the permit
 * @param expiryDate Expiry date of the permit
 * @returns True if either startDate or expiryDate are in the past
 */
export const isPermitStartOrExpiryDateInPast = (
  startDate: Dayjs,
  expiryDate: Dayjs,
) => {
  return (
    dayjs().isAfter(startDate, "day") || dayjs().isAfter(expiryDate, "day")
  );
};
