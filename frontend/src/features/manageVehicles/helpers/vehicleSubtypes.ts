import {
  BaseVehicle,
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
} from "../types/Vehicle";

/**
 * Determine whether or not a vehicle subtype ic considered to be LCV.
 * @param subtype Vehicle subtype
 * @returns If the subtype is considered to be LCV vehicle subtype
 */
export const isVehicleSubtypeLCV = (subtype: string) => {
  return ["LCVRMDB", "LCVTPDB"].includes(subtype);
};

export const EMPTY_VEHICLE_SUBTYPE = {
  typeCode: "",
  type: "",
  description: "",
};

export const selectedVehicleSubtype = (vehicle: BaseVehicle) => {
  switch (vehicle.vehicleType) {
    case VEHICLE_TYPES.POWER_UNIT:
      return (vehicle as PowerUnit).powerUnitTypeCode;
    case VEHICLE_TYPES.TRAILER:
      return (vehicle as Trailer).trailerTypeCode;
    default:
      return "";
  }
};
