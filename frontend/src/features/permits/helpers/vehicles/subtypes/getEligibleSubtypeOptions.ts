import { EMPTY_VEHICLE_SUBTYPE } from "../../../../manageVehicles/helpers/vehicleSubtypes";
import { VEHICLE_TYPES, VehicleSubType } from "../../../../manageVehicles/types/Vehicle";
import { sortVehicleSubtypes } from "./sortVehicleSubtypes";

/**
 * A helper method that filters allowed vehicle subtypes for dropdown lists.
 * @param allVehicleSubtypes List of all vehicle subtypes
 * @param allowedSubtypeCodes Set of allowed vehicle subtype codes
 * @returns List of only allowed vehicle subtypes
 */
const getAllowedVehicleSubtypes = (
  allVehicleSubtypes: VehicleSubType[],
  allowedSubtypeCodes: Set<string>,
) => {
  return allVehicleSubtypes.filter(({ typeCode }) => allowedSubtypeCodes.has(typeCode));
};

/**
 * Get vehicle subtype options for given vehicle type.
 * @param vehicleType Vehicle type
 * @param powerUnitSubtypes Vehicle subtypes for power units
 * @param trailerSubtypes Vehicle subtypes for trailers
 * @returns Correct vehicle subtype options for vehicle type
 */
const getSubtypeOptions = (
  vehicleType: string,
  powerUnitSubtypes: VehicleSubType[],
  trailerSubtypes: VehicleSubType[],
) => {
  if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
    return [...powerUnitSubtypes];
  }
  if (vehicleType === VEHICLE_TYPES.TRAILER) {
    return [...trailerSubtypes];
  }
  return [EMPTY_VEHICLE_SUBTYPE];
};

/**
 * Get eligible subset of vehicle subtype options given lists of available subtypes and criteria.
 * @param powerUnitSubtypes All available power unit subtypes
 * @param trailerSubtypes All available trailer subtypes
 * @param eligibleSubtypeCodes Set of eligible vehicle subtype codes by default
 * @param allowedLOASubtypeCodes Set of vehicle subtypes allowed by selected LOAs
 * @param vehicleType Vehicle type
 * @returns Eligible subset of vehicle subtype options
 */
export const getEligibleSubtypeOptions = (
  powerUnitSubtypes: VehicleSubType[],
  trailerSubtypes: VehicleSubType[],
  eligibleSubtypesCodes: Set<string>,
  allowedLOASubtypeCodes: Set<string>,
  vehicleType?: string,
) => {
  if (
    vehicleType !== VEHICLE_TYPES.POWER_UNIT &&
    vehicleType !== VEHICLE_TYPES.TRAILER
  ) {
    return [EMPTY_VEHICLE_SUBTYPE];
  }

  // Sort vehicle subtypes alphabetically
  const sortedVehicleSubtypes = sortVehicleSubtypes(
    vehicleType,
    getSubtypeOptions(vehicleType, powerUnitSubtypes, trailerSubtypes),
  );

  return getAllowedVehicleSubtypes(
    sortedVehicleSubtypes,
    new Set([...eligibleSubtypesCodes, ...allowedLOASubtypeCodes]),
  );
};
