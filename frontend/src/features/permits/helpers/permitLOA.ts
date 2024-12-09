import dayjs, { Dayjs } from "dayjs";

import { LOADetail } from "../../settings/types/LOADetail";
import { PermitType } from "../types/PermitType";
import { getEndOfDate, toLocalDayjs } from "../../../common/helpers/formatDate";
import { Nullable } from "../../../common/types/common";
import { Application, ApplicationFormData } from "../types/application";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { PowerUnit, Trailer, Vehicle, VEHICLE_TYPES } from "../../manageVehicles/types/Vehicle";
import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { getAllowedVehicles } from "./vehicles/getAllowedVehicles";
import { getDefaultVehicleDetails } from "./vehicles/getDefaultVehicleDetails";
import { PermitLOA } from "../types/PermitLOA";
import { isPermitVehicleWithinGvwLimit } from "./vehicles/rules/gvw";
import {
  durationOptionsForPermitType,
  getAvailableDurationOptions,
  getMinPermitExpiryDate,
  handleUpdateDurationIfNeeded,
} from "./dateSelection";

/**
 * Filter valid LOAs for a given permit type.
 * @param loas LOAs to filter
 * @param permitType The permit type that the LOA can be applicable for
 * @returns LOAs that can be applicable for the given permit type
 */
export const filterLOAsForPermitType = (
  loas: LOADetail[],
  permitType: PermitType,
) => {
  return loas.filter(loa => loa.loaPermitType.includes(permitType));
};

/**
 * Filter non-expired LOAs that do not expire before the start date of a permit. 
 * @param loas LOAs to filter
 * @param permitStart The start date of the permit
 * @returns LOAs that do not expire before the start date of the permit
 */
export const filterNonExpiredLOAs = (
  loas: LOADetail[],
  permitStart: Dayjs,
) => {
  return loas.filter(loa => (
    !loa.expiryDate
      || !permitStart.isAfter(
        getEndOfDate(toLocalDayjs(loa.expiryDate)),
      )
  ));
};

/**
 * Get the most recent expiry date for a list of LOAs.
 * @param loas LOAs with or without expiry dates
 * @returns The most recent expiry date for all the LOAs, or null if none of the LOAs expire
 */
export const getMostRecentExpiryFromLOAs = (loas: PermitLOA[]) => {
  const expiringLOAs = loas.filter(loa => Boolean(loa.expiryDate));
  if (expiringLOAs.length === 0) return null;

  const firstLOAExpiryDate = getEndOfDate(dayjs(expiringLOAs[0].expiryDate));
  return expiringLOAs.map(loa => loa.expiryDate)
    .reduce((prevExpiry, currExpiry) => {
      const prevExpiryDate = getEndOfDate(dayjs(prevExpiry));
      const currExpiryDate = getEndOfDate(dayjs(currExpiry));
      return prevExpiryDate.isAfter(currExpiryDate) ? currExpiryDate : prevExpiryDate;
    }, firstLOAExpiryDate);
};

/**
 * Get updated selectable LOAs with up-to-date information and selection state.
 * This removes non-existent selected LOAs, and updates any existing selected LOAs with up-to-date info.
 * @param upToDateLOAs Most recent up-to-date company LOAs
 * @param prevSelectedLOAs Previously selected LOAs
 * @param minPermitExpiryDate Min expiry date for a permit
 * @returns Updated list of selectable LOAs with up-to-date information and selection state
 */
export const getUpdatedLOASelection = (
  upToDateLOAs: LOADetail[],
  prevSelectedLOAs: PermitLOA[],
  minPermitExpiryDate: Dayjs,
) => {
  // Each LOA should only be selected once, but there's a chance that an up-to-date LOA is also a previously selected LOA,
  // which means that LOA should only be shown once.
  // Thus, any overlapping LOA between the up-to-date LOAs and previously selected LOAs should only be included once,
  // and all non-overlapping LOAs that are not part of the up-to-date LOAs should be removed
  const prevSelectedLOANumbers = new Set([...prevSelectedLOAs.map(loa => loa.loaNumber)]);

  return upToDateLOAs.map(loa => {
    const wasSelected = prevSelectedLOANumbers.has(loa.loaNumber);
    const isExpiringBeforeMinPermitExpiry = Boolean(loa.expiryDate)
      && minPermitExpiryDate.isAfter(getEndOfDate(dayjs(loa.expiryDate)));

    // Deselect and disable any LOAs expiring before min permit expiry date
    const isSelected = wasSelected && !isExpiringBeforeMinPermitExpiry;
    const isEnabled = !isExpiringBeforeMinPermitExpiry;
    
    return {
      loa: {
        loaId: loa.loaId,
        loaNumber: loa.loaNumber,
        companyId: loa.companyId,
        startDate: loa.startDate,
        expiryDate: loa.expiryDate,
        loaPermitType: loa.loaPermitType,
        powerUnits: loa.powerUnits,
        trailers: loa.trailers,
        originalLoaId: loa.originalLoaId,
        previousLoaId: loa.previousLoaId,
      },
      checked: isSelected,
      disabled: !isEnabled,
    };
  });
};

/**
 * Get updated vehicle details and options based on selected LOAs.
 * @param selectedLOAs LOAs that are selected for the permit
 * @param vehicleOptions Provided vehicle options for selection
 * @param prevSelectedVehicle Previously selected vehicle details in the permit form
 * @param eligibleSubtypes Set of eligible vehicle subtypes
 * @param vehicleRestrictions Restriction rules that each vehicle must meet
 * @returns Updated vehicle details and filtered vehicle options
 */
export const getUpdatedVehicleDetailsForLOAs = (
  selectedLOAs: PermitLOA[],
  vehicleOptions: (PowerUnit | Trailer)[],
  prevSelectedVehicle: PermitVehicleDetails,
  eligibleSubtypes: Set<string>,
  vehicleRestrictions: ((vehicle: Vehicle) => boolean)[],
) => {
  const filteredVehicles = getAllowedVehicles(
    vehicleOptions,
    eligibleSubtypes,
    selectedLOAs,
    vehicleRestrictions,
  );
  
  const filteredVehicleIds = filteredVehicles.map(filteredVehicle => ({
    filteredVehicleType: filteredVehicle.vehicleType,
    filteredVehicleId: filteredVehicle.vehicleType === VEHICLE_TYPES.TRAILER
      ? (filteredVehicle as Trailer).trailerId
      : (filteredVehicle as PowerUnit).powerUnitId,
  }));

  // If vehicle selected is an existing vehicle but is not in list of vehicle options
  // Clear the selected vehicle
  const { vehicleId, vehicleType } = prevSelectedVehicle;
  if (vehicleId && !filteredVehicleIds.some(({
    filteredVehicleType,
    filteredVehicleId,
  }) => filteredVehicleType === vehicleType && filteredVehicleId === vehicleId)) {
    return {
      filteredVehicleOptions: filteredVehicles,
      updatedVehicle: getDefaultVehicleDetails(),
    };
  }

  return {
    filteredVehicleOptions: filteredVehicles,
    updatedVehicle: prevSelectedVehicle,
  };
};

/**
 * Applying the most up-to-date LOA info to application data.
 * @param applicationData Existing application data
 * @param upToDateLOAs Most recent up-to-date company LOAs
 * @param inventoryVehicles Vehicle options from the inventory
 * @param eligibleVehicleSubtypes Set of eligible vehicle subtypes that can be used for vehicles
 * @returns Application data after applying the up-to-date LOAs
 */
export const applyUpToDateLOAsToApplication = <T extends Nullable<ApplicationFormData | Application>>(
  applicationData: T,
  upToDateLOAs: LOADetail[],
  inventoryVehicles: (PowerUnit | Trailer)[],
  eligibleVehicleSubtypes: Set<string>,
): T => {
  // If application doesn't exist, no need to apply LOAs to it at all
  if (!applicationData) return applicationData;

  // Applicable LOAs must be:
  // 1. Applicable for the current permit type
  // 2. Have expiry date that is on or after the start date for an application
  const applicableLOAs = filterNonExpiredLOAs(
    filterLOAsForPermitType(
      getDefaultRequiredVal([], upToDateLOAs),
      applicationData.permitType,
    ),
    applicationData.permitData.startDate,
  );

  // Update selected LOAs in the permit data
  const prevSelectedLOAs = getDefaultRequiredVal([], applicationData.permitData.loas);
  const minPermitExpiryDate = getMinPermitExpiryDate(
    applicationData.permitType,
    applicationData.permitData.startDate,
  );

  const newSelectedLOAs = getUpdatedLOASelection(
    applicableLOAs,
    prevSelectedLOAs,
    minPermitExpiryDate,
  )
    .filter(({ checked }) => checked)
    .map(({ loa }) => loa);

  // Update duration in permit if selected LOAs changed
  const durationOptions = getAvailableDurationOptions(
    durationOptionsForPermitType(applicationData.permitType),
    newSelectedLOAs,
    applicationData.permitData.startDate,
  );

  const updatedDuration = handleUpdateDurationIfNeeded(
    applicationData.permitType,
    applicationData.permitData.permitDuration,
    durationOptions,
  );

  // Update vehicle details in permit if selected LOAs changed
  const { updatedVehicle } = getUpdatedVehicleDetailsForLOAs(
    newSelectedLOAs,
    inventoryVehicles,
    applicationData.permitData.vehicleDetails,
    eligibleVehicleSubtypes,
    [
      (v) => v.vehicleType !== VEHICLE_TYPES.POWER_UNIT
        || isPermitVehicleWithinGvwLimit(
          applicationData.permitType,
          VEHICLE_TYPES.POWER_UNIT,
          (v as PowerUnit).licensedGvw,
        ),
    ],
  );

  return {
    ...applicationData,
    permitData: {
      ...applicationData.permitData,
      permitDuration: updatedDuration,
      loas: newSelectedLOAs,
      vehicleDetails: updatedVehicle,
    },
  };
};
