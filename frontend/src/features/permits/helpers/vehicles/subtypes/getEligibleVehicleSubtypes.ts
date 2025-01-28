import { Policy } from "onroute-policy-engine";

import { Nullable } from "../../../../../common/types/common";
import { PermitType } from "../../../types/PermitType";
import { getDefaultRequiredVal } from "../../../../../common/helpers/util";

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
  selectedCommodity?: Nullable<string>,
  policyEngine?: Nullable<Policy>,
) => {
  if (!policyEngine)
    return new Set<string>();

  // The policy engine requires a commodity to be provided for any
  // permit type where commodity is required, hence the nullish
  // coalescing operator on the second parameter. An empty string will
  // result in an empty map returned.
  const subtypesMap = policyEngine.getPermittableVehicleTypes(
    permitType,
    getDefaultRequiredVal('-', selectedCommodity),
  );
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
    ],
  );
};
