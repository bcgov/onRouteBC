import { convertToNumberIfValid } from "../../../../common/helpers/numeric/convertToNumberIfValid";
import { Nullable, RequiredOrNull } from "../../../../common/types/common";
import { PermitVehicleConfiguration } from "../../types/PermitVehicleConfiguration";

/**
 * Serialize permit vehicle configuration values as request payload.
 * @param vehicleConfiguration Permit vehicle configuration
 * @returns Serialized permit vehicle configuration values
 */
export const serializePermitVehicleConfiguration = (
  vehicleConfiguration?: Nullable<PermitVehicleConfiguration>,
): RequiredOrNull<PermitVehicleConfiguration> => {
  return vehicleConfiguration ? {
    trailers: vehicleConfiguration.trailers,
    frontProjection: convertToNumberIfValid(
      vehicleConfiguration.frontProjection,
      null,
    ),
    rearProjection: convertToNumberIfValid(
      vehicleConfiguration.rearProjection,
      null,
    ),
    overallWidth: convertToNumberIfValid(
      vehicleConfiguration.overallWidth,
      null,
    ),
    overallHeight: convertToNumberIfValid(
      vehicleConfiguration.overallHeight,
      null,
    ),
    overallLength: convertToNumberIfValid(
      vehicleConfiguration.overallLength,
      null,
    ),
  } : null;
};
