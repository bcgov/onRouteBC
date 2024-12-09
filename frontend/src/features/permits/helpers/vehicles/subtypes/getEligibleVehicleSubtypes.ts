import { Policy } from "onroute-policy-engine";

import { Nullable } from "../../../../../common/types/common";
import { PERMIT_TYPES, PermitType } from "../../../types/PermitType";
import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { TROW_ELIGIBLE_VEHICLE_SUBTYPES } from "../../../constants/trow";
import { TROS_ELIGIBLE_VEHICLE_SUBTYPES } from "../../../constants/tros";
import {
  DEFAULT_COMMODITY_SELECT_VALUE,
  LCV_VEHICLE_SUBTYPES,
} from "../../../constants/constants";

/**
 * Get eligible vehicle subtypes based on given criteria.
 * @param permitType Permit type
 * @param isLcvDesignated Whether or not LCV flag is designated
 * @param selectedCommodity The selected commodity, if applicable for this permit type
 * @param policyEngine The policy engine used to find vehicle subtypes
 * @returns List of eligible vehicle subtypes that can be used
 */
export const getEligibleVehicleSubtypes = (
  permitType: PermitType,
  isLcvDesignated: boolean,
  selectedCommodity?: Nullable<string>,
  policyEngine?: Nullable<Policy>,
) => {
  const lcvSubtypes = LCV_VEHICLE_SUBTYPES.map(({ typeCode }) => typeCode);
  switch (permitType) {
    case PERMIT_TYPES.STOS: {
      if (!selectedCommodity || !policyEngine || (selectedCommodity === DEFAULT_COMMODITY_SELECT_VALUE))
        return new Set<string>();

      const subtypesMap = policyEngine.getPermittableVehicleTypes(permitType, selectedCommodity);
      return new Set(
        [
          ...getDefaultRequiredVal(
            new Map<string, string>(),
            subtypesMap.get("powerUnits"),
          ).keys(),
          ...getDefaultRequiredVal(
            new Map<string, string>(),
            subtypesMap.get("trailers"),
          ).keys(),
        ].concat(isLcvDesignated ? lcvSubtypes : []),
      );
    }
    // Policy engine currently doesn't return vehicle subtypes unless a commodity is provided
    // which TROW and TROS doesn't have, thus here the hardcoded subtypes are being used
    case PERMIT_TYPES.TROW:
      return new Set(
        TROW_ELIGIBLE_VEHICLE_SUBTYPES.concat(isLcvDesignated ? lcvSubtypes : []),
      );
    case PERMIT_TYPES.TROS:
      return new Set(
        TROS_ELIGIBLE_VEHICLE_SUBTYPES.concat(isLcvDesignated ? lcvSubtypes : []),
      );
    default:
      return new Set<string>();
  }
};
