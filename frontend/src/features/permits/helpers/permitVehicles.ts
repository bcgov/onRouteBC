import { PERMIT_TYPES, PermitType } from "../types/PermitType";
import { TROW_INELIGIBLE_POWERUNITS, TROW_INELIGIBLE_TRAILERS } from "../constants/trow";
import { TROS_INELIGIBLE_POWERUNITS, TROS_INELIGIBLE_TRAILERS } from "../constants/tros";
import { PermitLOA } from "../types/PermitLOA";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable } from "../../../common/types/common";
import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { EMPTY_VEHICLE_SUBTYPE, isVehicleSubtypeLCV } from "../../manageVehicles/helpers/vehicleSubtypes";
import {
  PowerUnit,
  Trailer,
  VehicleSubType,
  VehicleType,
  VEHICLE_TYPES,
  Vehicle,
} from "../../manageVehicles/types/Vehicle";
import { sortVehicleSubTypes } from "./sorter";

export const getIneligiblePowerUnitSubtypes = (permitType: PermitType) => {
  switch (permitType) {
    case PERMIT_TYPES.TROW:
      return TROW_INELIGIBLE_POWERUNITS;
    case PERMIT_TYPES.TROS:
      return TROS_INELIGIBLE_POWERUNITS;
    default:
      return [];
  }
};

export const getIneligibleTrailerSubtypes = (permitType: PermitType) => {
  switch (permitType) {
    case PERMIT_TYPES.TROW:
      return TROW_INELIGIBLE_TRAILERS;
    case PERMIT_TYPES.TROS:
      return TROS_INELIGIBLE_TRAILERS;
    default:
      return [];
  }
};

/**
 * Get all ineligible power unit and trailer subtypes based on LCV designation and permit type.
 * @param permitType Permit type
 * @param isLcvDesignated Whether or not the LCV designation is used
 * @returns All ineligible power unit and trailer subtypes
 */
export const getIneligibleSubtypes = (
  permitType: PermitType,
  isLcvDesignated: boolean,
) => {
  return {
    ineligibleTrailerSubtypes: getIneligibleTrailerSubtypes(permitType),
    ineligiblePowerUnitSubtypes: getIneligiblePowerUnitSubtypes(permitType)
      .filter(subtype => !isLcvDesignated || !isVehicleSubtypeLCV(subtype.typeCode)),
  };
};

/**
 * Gets default values for vehicle details, or populate with values from existing vehicle details.
 * @param vehicleDetails existing vehicle details, if any
 * @returns default values for vehicle details
 */
export const getDefaultVehicleDetails = (
  vehicleDetails?: Nullable<PermitVehicleDetails>,
) => ({
  vehicleId: getDefaultRequiredVal("", vehicleDetails?.vehicleId),
  unitNumber: getDefaultRequiredVal("", vehicleDetails?.unitNumber),
  vin: getDefaultRequiredVal("", vehicleDetails?.vin),
  plate: getDefaultRequiredVal("", vehicleDetails?.plate),
  make: getDefaultRequiredVal("", vehicleDetails?.make),
  year: applyWhenNotNullable((year) => year, vehicleDetails?.year, null),
  countryCode: getDefaultRequiredVal("", vehicleDetails?.countryCode),
  provinceCode: getDefaultRequiredVal("", vehicleDetails?.provinceCode),
  vehicleType: getDefaultRequiredVal("", vehicleDetails?.vehicleType),
  vehicleSubType: getDefaultRequiredVal("", vehicleDetails?.vehicleSubType),
  saveVehicle: false,
});

/**
 * A helper method that filters eligible power unit or trailer subtypes for dropdown lists.
 * @param allVehicleSubtypes List of both eligible and ineligible vehicle subtypes
 * @param vehicleType Type of vehicle
 * @param ineligiblePowerUnitSubtypes List of provided ineligible power unit subtypes
 * @param ineligibleTrailerSubtypes List of provided ineligible trailer subtypes
 * @param allowedPowerUnitSubtypes List of provided allowed power unit subtypes
 * @param allowedTrailerSubtypes List of provided allowed trailer subtypes
 * @returns List of only eligible power unit or trailer subtypes
 */
export const filterVehicleSubtypes = (
  allVehicleSubtypes: VehicleSubType[],
  vehicleType: VehicleType,
  ineligiblePowerUnitSubtypes: VehicleSubType[],
  ineligibleTrailerSubtypes: VehicleSubType[],
  allowedPowerUnitSubtypes: string[],
  allowedTrailerSubtypes: string[],
) => {
  const ineligibleSubtypes = vehicleType === VEHICLE_TYPES.TRAILER
    ? ineligibleTrailerSubtypes : ineligiblePowerUnitSubtypes;

  const allowedSubtypes = vehicleType === VEHICLE_TYPES.TRAILER
    ? allowedTrailerSubtypes : allowedPowerUnitSubtypes;

  return allVehicleSubtypes.filter((vehicleSubtype) => {
    return allowedSubtypes.some(
      allowedSubtype => vehicleSubtype.typeCode === allowedSubtype
    ) || !ineligibleSubtypes.some(
      (ineligibleSubtype) => vehicleSubtype.typeCode === ineligibleSubtype.typeCode,
    );
  });
};

/**
 * A helper method that filters power unit or trailer vehicles from dropdown lists.
 * @param vehicles List of both eligible and ineligible vehicles
 * @param ineligiblePowerUnitSubtypes List of ineligible power unit subtypes
 * @param ineligibleTrailerSubtypes List of ineligible trailer subtypes
 * @param loas LOAs that potentially bypass ineligible vehicle restrictions
 * @returns List of only eligible vehicles
 */
export const filterVehicles = (
  vehicles: Vehicle[],
  ineligiblePowerUnitSubtypes: string[],
  ineligibleTrailerSubtypes: string[],
  loas: PermitLOA[],
) => {
  const permittedPowerUnitIds = new Set([
    ...loas.map(loa => loa.powerUnits)
      .reduce((prevPowerUnits, currPowerUnits) => [
        ...prevPowerUnits,
        ...currPowerUnits,
      ], []),
  ]);

  const permittedTrailerIds = new Set([
    ...loas.map(loa => loa.trailers)
      .reduce((prevTrailers, currTrailers) => [
        ...prevTrailers,
        ...currTrailers,
      ], []),
  ]);

  return vehicles.filter((vehicle) => {
    if (vehicle.vehicleType === VEHICLE_TYPES.TRAILER) {
      const trailer = vehicle as Trailer;
      return permittedTrailerIds.has(trailer.trailerId as string)
        || !ineligibleTrailerSubtypes.some((ineligibleSubtype) => {
          return trailer.trailerTypeCode === ineligibleSubtype;
        });
    }

    const powerUnit = vehicle as PowerUnit;
    return permittedPowerUnitIds.has(powerUnit.powerUnitId as string)
      || !ineligiblePowerUnitSubtypes.some((ineligibleSubtype) => {
        return powerUnit.powerUnitTypeCode === ineligibleSubtype;
      });
  });
};

/**
 * Get vehicle subtype options for given vehicle type.
 * @param vehicleType Vehicle type
 * @param powerUnitSubtypes Vehicle subtypes for power units
 * @param trailerSubtypes Vehicle subtypes for trailers
 * @returns Correct vehicle subtype options for vehicle type
 */
export const getSubtypeOptions = (
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
 * @param ineligiblePowerUnitSubtypes List of ineligible power unit subtypes
 * @param ineligibleTrailerSubtypes List of ineligible trailer subtypes
 * @param allowedLOAPowerUnitSubtypes List of power unit subtypes allowed by LOAs
 * @param allowedLOATrailerSubtypes List of trailer subtypes allowed by LOAs
 * @param vehicleType Vehicle type
 * @returns Eligible subset of vehicle subtype options
 */
export const getEligibleSubtypeOptions = (
  powerUnitSubtypes: VehicleSubType[],
  trailerSubtypes: VehicleSubType[],
  ineligiblePowerUnitSubtypes: VehicleSubType[],
  ineligibleTrailerSubtypes: VehicleSubType[],
  allowedLOAPowerUnitSubtypes: string[],
  allowedLOATrailerSubtypes: string[],
  vehicleType?: string,
) => {
  if (
    vehicleType !== VEHICLE_TYPES.POWER_UNIT &&
    vehicleType !== VEHICLE_TYPES.TRAILER
  ) {
    return [EMPTY_VEHICLE_SUBTYPE];
  }

  // Sort vehicle subtypes alphabetically
  const sortedVehicleSubtypes = sortVehicleSubTypes(
    vehicleType,
    getSubtypeOptions(vehicleType, powerUnitSubtypes, trailerSubtypes),
  );

  return filterVehicleSubtypes(
    sortedVehicleSubtypes,
    vehicleType,
    ineligiblePowerUnitSubtypes,
    ineligibleTrailerSubtypes,
    allowedLOAPowerUnitSubtypes,
    allowedLOATrailerSubtypes,
  );
};
