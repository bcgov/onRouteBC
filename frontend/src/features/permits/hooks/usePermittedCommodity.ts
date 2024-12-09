import { useCallback } from "react";
import { Policy } from "onroute-policy-engine";

import { PermitType } from "../types/PermitType";
import { Nullable } from "../../../common/types/common";
import { useCommodityOptions } from "./useCommodityOptions";

export const usePermittedCommodity = (
  policyEngine: Policy,
  permitType: PermitType,
  onSetCommodityType: (commodityType: string) => void,
  onClearVehicle: () => void,
  onClearVehicleConfig: (permitType: PermitType) => void,
  selectedCommodityType?: Nullable<string>,
) => {
  const { commodityOptions } = useCommodityOptions(policyEngine, permitType);

  const onChangeCommodityType = useCallback((commodityType: string) => {
    if (selectedCommodityType !== commodityType) {
      onSetCommodityType(commodityType);
      onClearVehicle();
      onClearVehicleConfig(permitType);
    }
  }, [
    onSetCommodityType,
    onClearVehicleConfig,
    selectedCommodityType,
    permitType,
  ]);

  return {
    commodityOptions,
    onChangeCommodityType,
  };
};
