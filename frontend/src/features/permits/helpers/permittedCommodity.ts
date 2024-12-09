import { Policy } from "onroute-policy-engine";

import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable, RequiredOrNull } from "../../../common/types/common";
import { PermittedCommodity } from "../types/PermittedCommodity";
import { PERMIT_TYPES, PermitType } from "../types/PermitType";
import {
  DEFAULT_COMMODITY_SELECT_OPTION,
  DEFAULT_COMMODITY_SELECT_VALUE,
} from "../constants/constants";

/**
 * Get default permitted commodity data for an application/permit, or null if not applicable.
 * @param permitType Permit type
 * @param permittedCommodity Permitted commodity data if it already exists
 * @returns Default permitted commodity data, or null
 */
export const getDefaultPermittedCommodity = (
  permitType: PermitType,
  permittedCommodity?: Nullable<PermittedCommodity>,
): RequiredOrNull<PermittedCommodity> => {
  if (permitType !== PERMIT_TYPES.STOS) return null;

  return {
    commodityType: getDefaultRequiredVal(
      DEFAULT_COMMODITY_SELECT_VALUE,
      permittedCommodity?.commodityType,
    ),
    loadDescription: getDefaultRequiredVal(
      "",
      permittedCommodity?.loadDescription,
    ),
  };
};

/**
 * Get list of permitted commodity options for a given permit type.
 * @param permitType Permit type
 * @param policyEngine Instance of the policy engine, if it exists
 * @returns List of permitted commodity options
 */
export const getPermittedCommodityOptions = (
  permitType: PermitType,
  policyEngine?: Nullable<Policy>,
) => {
  const commodities = getDefaultRequiredVal(
    new Map<string, string>(),
    policyEngine?.getCommodities(permitType),
  );

  return [DEFAULT_COMMODITY_SELECT_OPTION].concat(
    [...commodities.entries()]
      .map(([commodityType, commodityDescription]) => ({
        value: commodityType,
        label: commodityDescription,
      })),
  );
};
