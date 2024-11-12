import { useEffect, useMemo } from "react";

import { PermitCondition } from "../types/PermitCondition";
import { doUniqueArraysHaveSameItems } from "../../../common/helpers/equality";
import { PermitType } from "../types/PermitType";
import { getPermitConditionSelectionState } from "../helpers/conditions";

export const usePermitConditions = (
  permitType: PermitType,
  selectedConditions: PermitCondition[],
  isLcvDesignated: boolean,
  vehicleSubtype: string,
  onSetConditions: (conditions: PermitCondition[]) => void,
) => {
  // All possible conditions to be used for conditions table, including non-selected ones
  const allConditions = useMemo(() => {
    return getPermitConditionSelectionState(
      permitType,
      isLcvDesignated,
      vehicleSubtype,
      selectedConditions,
    );
  }, [
    permitType,
    isLcvDesignated,
    vehicleSubtype,
    selectedConditions,
  ]);

  const updatedConditions = allConditions
    .filter(({ checked }) => checked);

  useEffect(() => {
    if (!doUniqueArraysHaveSameItems(
      updatedConditions.map(({ condition }) => condition),
      selectedConditions.map(({ condition }) => condition),
    )) {
      onSetConditions(updatedConditions);
    }
  }, [
    updatedConditions,
    selectedConditions,
  ]);

  return { allConditions };
};
