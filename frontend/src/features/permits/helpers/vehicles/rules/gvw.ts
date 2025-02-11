import { VEHICLE_TYPES, VehicleType } from "../../../../manageVehicles/types/Vehicle";
import { PERMIT_TYPES, PermitType } from "../../../types/PermitType";
import {
  isNull,
  isUndefined,
  Nullable,
  Optional,
} from "../../../../../common/types/common";

export const gvwLimit = (permitType: PermitType) => {
  if (permitType === PERMIT_TYPES.STOS || permitType === PERMIT_TYPES.MFP) {
    return 63500;
  }
  
  // For term permits the gvw limit is 64000 kg, but this is not yet implemented
  // In the future, this may change
  return undefined;
};

export const isWithinGvwLimit = (
  gvw?: Nullable<number>,
  limit?: Optional<number>,
) => {
  if (isUndefined(gvw) || isNull(gvw) || isUndefined(limit)) return true;
  return gvw <= limit;
};

export const isPermitVehicleWithinGvwLimit = (
  permitType: PermitType,
  vehicleType: VehicleType,
  gvw?: Nullable<number>,
) => {
  if (vehicleType !== VEHICLE_TYPES.POWER_UNIT) return true;
  
  const limit = gvwLimit(permitType);
  return isWithinGvwLimit(gvw, limit);
};
