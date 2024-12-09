import { DATE_FORMATS, dayjsToLocalStr } from "../../../../common/helpers/formatDate";
import { PermitData } from "../../types/PermitData";
import { ReplaceDayjsWithString } from "../../types/utility";
import { serializePermitVehicleConfiguration } from "./serializePermitVehicleConfiguration";
import { serializePermitVehicleDetails } from "./serializePermitVehicleDetails";

export const serializePermitData = (
  permitData: PermitData,
): ReplaceDayjsWithString<PermitData> => {
  const {
    startDate,
    expiryDate,
    vehicleDetails,
    vehicleConfiguration,
    permittedRoute,
    ...restOfPermitData
  } = permitData;

  const serializedPermittedRoute = permittedRoute
    ? {
      manualRoute: permittedRoute.manualRoute
        ? {
          ...permittedRoute.manualRoute,
          highwaySequence: permittedRoute.manualRoute.highwaySequence
            .filter(highwayNumber => Boolean(highwayNumber.trim())),
        }
        : null,
      routeDetails: permittedRoute.routeDetails,
    }
    : null;

  return {
    ...restOfPermitData,
    startDate: dayjsToLocalStr(
      startDate,
      DATE_FORMATS.DATEONLY,
    ),
    expiryDate: dayjsToLocalStr(
      expiryDate,
      DATE_FORMATS.DATEONLY,
    ),
    vehicleDetails: serializePermitVehicleDetails(vehicleDetails),
    vehicleConfiguration: serializePermitVehicleConfiguration(vehicleConfiguration),
    permittedRoute: serializedPermittedRoute,
  };
};