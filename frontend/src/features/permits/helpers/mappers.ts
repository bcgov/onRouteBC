import { PermitsActionResponse } from "../types/permit";
import { Nullable, Optional } from "../../../common/types/common";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import {
  PERMIT_APPLICATION_ORIGINS,
  PermitApplicationOrigin,
} from "../types/PermitApplicationOrigin";

import {
  IDIR_USER_ROLE,
  UserRoleType,
} from "../../../common/authentication/types";

import {
  Vehicle,
  VehicleType,
  VEHICLE_TYPES,
  PowerUnit,
  Trailer,
} from "../../manageVehicles/types/Vehicle";

/**
 * Find a vehicle from a list of existing vehicles that matches the vehicle type and id.
 * @param existingVehicles List of existing vehicles
 * @param vehicleType Vehicle type
 * @param vehicleId Vehicle id
 * @returns The vehicle found in the provided list, or undefined if not found
 */
export const findFromExistingVehicles = (
  existingVehicles: Vehicle[],
  vehicleType: VehicleType,
  vehicleId?: Nullable<string>,
): Optional<Vehicle> => {
  return existingVehicles.find((existingVehicle) => {
    if (existingVehicle.vehicleType !== vehicleType) return false;
    return vehicleType === VEHICLE_TYPES.TRAILER
      ? (existingVehicle as Trailer).trailerId === vehicleId
      : (existingVehicle as PowerUnit).powerUnitId === vehicleId;
  });
};

/**
 * Get full vehicle subtype name by type code.
 * @param powerUnitSubtypeNamesMap Map of power unit subtypes (typeCode to subtype name)
 * @param trailerSubtypeNamesMap Map of trailer subtypes (typeCode to subtype name)
 * @param vehicleType Vehicle type
 * @param typeCode Type code for a subtype
 * @returns The found vehicle subtype name, or undefined if not found
 */
export const getSubtypeNameByCode = (
  powerUnitSubtypeNamesMap: Map<string, string>,
  trailerSubtypeNamesMap: Map<string, string>,
  vehicleType: string,
  typeCode: string,
) => {
  if (vehicleType === VEHICLE_TYPES.TRAILER) {
    return trailerSubtypeNamesMap.get(typeCode);
  }
  
  return powerUnitSubtypeNamesMap.get(typeCode);
};

/**
 * Gets display text for vehicle type.
 * @param vehicleType Vehicle type (power unit or trailer)
 * @returns Display text for the vehicle type
 */
export const vehicleTypeDisplayText = (vehicleType: VehicleType) => {
  if (vehicleType === VEHICLE_TYPES.TRAILER) {
    return "Trailer";
  }
  return "Power Unit";
};

/**
 * Remove empty values from permits action response
 * @param res Permits action response received from backend
 * @returns Permits action response having empty values removed
 */
export const removeEmptyIdsFromPermitsActionResponse = (
  res: PermitsActionResponse,
): PermitsActionResponse => {
  const successIds = getDefaultRequiredVal([], res.success).filter((id) =>
    Boolean(id),
  );
  const failedIds = getDefaultRequiredVal([], res.failure).filter((id) =>
    Boolean(id),
  );
  return {
    success: successIds,
    failure: failedIds,
  };
};

/**
 * Determine whether or not a given user can access/delete an application.
 * @param permitApplicationOrigin Permit application origin
 * @param role Role of the logged in user
 * @returns Whether or not the user can access/delete the application.
 */
export const canUserAccessApplication = (
  permitApplicationOrigin?: Nullable<PermitApplicationOrigin>,
  role?: Nullable<UserRoleType>,
) => {
  if (!role) return false;

  // CV/PA can only access/delete applications whose origins are not "PPC"
  // Staff can access/delete any application they have access to (including each others')
  return (
    permitApplicationOrigin !== PERMIT_APPLICATION_ORIGINS.PPC ||
    (Object.values(IDIR_USER_ROLE) as UserRoleType[]).includes(role)
  );
};
