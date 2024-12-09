import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../common/helpers/util";
import { Nullable } from "../../../../common/types/common";
import { DEFAULT_VEHICLE_TYPE, PermitVehicleDetails } from "../../types/PermitVehicleDetails";

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
  vehicleType: getDefaultRequiredVal(DEFAULT_VEHICLE_TYPE, vehicleDetails?.vehicleType),
  vehicleSubType: getDefaultRequiredVal("", vehicleDetails?.vehicleSubType),
  licensedGVW: getDefaultRequiredVal(null, vehicleDetails?.licensedGVW),
  saveVehicle: false,
});
