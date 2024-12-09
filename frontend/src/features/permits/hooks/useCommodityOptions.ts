import { useMemo } from "react";
import { Policy } from "onroute-policy-engine";

import { getPermittedCommodityOptions } from "../helpers/permittedCommodity";
import { Nullable } from "../../../common/types/common";
import { PermitType } from "../types/PermitType";

export const useCommodityOptions = (
  policyEngine: Nullable<Policy>,
  permitType: PermitType,
) => {
  const commodityOptions = useMemo(() => {
    return getPermittedCommodityOptions(permitType, policyEngine);
  }, [policyEngine, permitType]);

  return {
    commodityOptions,
  };
};
