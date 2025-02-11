import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { Nullable } from "../../../../common/types/common";
import { ManualRoute } from "../../types/PermittedRoute";
import { PERMIT_TYPES, PermitType } from "../../types/PermitType";

export const getDefaultManualRoute = (
  permitType: PermitType,
  manualRoute?: Nullable<ManualRoute>,
): ManualRoute => {
  return {
    origin: getDefaultRequiredVal("", manualRoute?.origin),
    destination: getDefaultRequiredVal("", manualRoute?.destination),
    highwaySequence: getDefaultRequiredVal(
      [],
      manualRoute?.highwaySequence)
        .filter(highwayNumber => Boolean(highwayNumber.trim()),
    ),
    exitPoint: permitType === PERMIT_TYPES.MFP
      ? getDefaultRequiredVal(null, manualRoute?.exitPoint)
      : null,
    totalDistance: permitType === PERMIT_TYPES.MFP
      ? getDefaultRequiredVal(null, manualRoute?.totalDistance)
      : null,
  };
};
