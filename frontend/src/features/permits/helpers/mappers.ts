import { Permit, PermitsActionResponse } from "../types/permit";
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
  VehicleSubType,
  Vehicle,
  VehicleType,
  VEHICLE_TYPES,
  PowerUnit,
  Trailer,
} from "../../manageVehicles/types/Vehicle";

/**
 * This helper function is used to get the vehicle object that matches the vehicleType and id.
 * @param vehicles List of existing vehicles
 * @param vehicleType Type of vehicle
 * @param id string used as a key to find the existing vehicle
 * @returns The found Vehicle object in the provided list, or undefined if not found
 */
export const mapToVehicleObjectById = (
  vehicles: Optional<Vehicle[]>,
  vehicleType: VehicleType,
  id: Nullable<string>,
): Optional<Vehicle> => {
  if (!vehicles) return undefined;

  return vehicles.find((item) => {
    return vehicleType === VEHICLE_TYPES.POWER_UNIT
      ? item.vehicleType === VEHICLE_TYPES.POWER_UNIT &&
          (item as PowerUnit).powerUnitId === id
      : item.vehicleType === VEHICLE_TYPES.TRAILER &&
          (item as Trailer).trailerId === id;
  });
};

/**
 * Maps the typeCode (Example: GRADERS) to the corresponding Trailer or PowerUnit subtype object, then return that object
 * @param typeCode
 * @param vehicleType
 * @param powerUnitSubTypes
 * @param trailerSubTypes
 * @returns A Vehicle Sub type object
 */
export const mapTypeCodeToObject = (
  typeCode: string,
  vehicleType: string,
  powerUnitSubTypes: Nullable<VehicleSubType[]>,
  trailerSubTypes: Nullable<VehicleSubType[]>,
) => {
  let typeObject = undefined;

  if (powerUnitSubTypes && vehicleType === VEHICLE_TYPES.POWER_UNIT) {
    typeObject = powerUnitSubTypes.find((v) => {
      return v.typeCode == typeCode;
    });
  } else if (trailerSubTypes && vehicleType === VEHICLE_TYPES.TRAILER) {
    typeObject = trailerSubTypes.find((v) => {
      return v.typeCode == typeCode;
    });
  }

  return typeObject;
};

/**
 * Gets display text for vehicle type.
 * @param vehicleType Vehicle type (powerUnit or trailer)
 * @returns display text for the vehicle type
 */
export const vehicleTypeDisplayText = (vehicleType: VehicleType) => {
  if (vehicleType === VEHICLE_TYPES.TRAILER) {
    return "Trailer";
  }
  return "Power Unit";
};

/**
 * Get a cloned permit.
 * @param permit Permit to clone
 * @returns Cloned permit with same fields and nested fields as old permit, but different reference
 */
export const clonePermit = (permit: Permit): Permit => {
  return {
    ...permit,
    permitData: {
      ...permit.permitData,
      contactDetails: {
        ...permit.permitData.contactDetails,
      },
      vehicleDetails: {
        ...permit.permitData.vehicleDetails,
      },
      commodities: [...permit.permitData.commodities],
      loas: [...getDefaultRequiredVal([], permit.permitData.loas)],
      mailingAddress: {
        ...permit.permitData.mailingAddress,
      },
    },
  };
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
