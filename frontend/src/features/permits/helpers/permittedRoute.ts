import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable, RequiredOrNull } from "../../../common/types/common";
import { PermittedRoute } from "../types/PermittedRoute";
import { PERMIT_TYPES, PermitType } from "../types/PermitType";

export const getDefaultPermittedRoute = (
  permitType: PermitType,
  permittedRoute?: Nullable<PermittedRoute>,
): RequiredOrNull<PermittedRoute> => {
  if (permitType !== PERMIT_TYPES.STOS) return null;
  
  return {
    manualRoute: {
      origin: getDefaultRequiredVal("", permittedRoute?.manualRoute?.origin),
      destination: getDefaultRequiredVal("", permittedRoute?.manualRoute?.destination),
      highwaySequence: getDefaultRequiredVal(
        [],
        permittedRoute?.manualRoute?.highwaySequence)
          .filter(highwayNumber => Boolean(highwayNumber.trim()),
      ),
      exitPoint: getDefaultRequiredVal(null, permittedRoute?.manualRoute?.exitPoint),
      totalDistance: getDefaultRequiredVal(null, permittedRoute?.manualRoute?.totalDistance),
    },
    routeDetails: getDefaultRequiredVal("", permittedRoute?.routeDetails),
  };
};
