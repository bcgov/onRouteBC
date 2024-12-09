import { PermitVehicleDetails } from "../../types/PermitVehicleDetails";
import { convertToNumberIfValid } from "../../../../common/helpers/numeric/convertToNumberIfValid";

/**
 * Serialize permit vehicles details data to be used as request payload.
 * @param vehicleDetails Permit vehicle details info
 * @param defaultVehicleYear Default vehicle year to fallback to if vehicle details year is invalid
 * @returns Serialized permit vehicles details data to be used as request payload
 */
export const serializePermitVehicleDetails = (
  vehicleDetails: PermitVehicleDetails,
): PermitVehicleDetails => {
  return {
    vin: vehicleDetails.vin,
    plate: vehicleDetails.plate,
    make: vehicleDetails.make,
    // Convert year to number here, as React doesn't accept valueAsNumber prop for input component
    year: convertToNumberIfValid(vehicleDetails.year, null),
    countryCode: vehicleDetails.countryCode,
    provinceCode: vehicleDetails.provinceCode,
    vehicleType: vehicleDetails.vehicleType,
    vehicleSubType: vehicleDetails.vehicleSubType,
    saveVehicle: vehicleDetails.saveVehicle,
    unitNumber: vehicleDetails.unitNumber,
    // Either powerUnitId or trailerId, depending on vehicleType
    vehicleId: vehicleDetails.vehicleId,
    licensedGVW: convertToNumberIfValid(
      vehicleDetails.licensedGVW,
      null,
    ),
  };
};