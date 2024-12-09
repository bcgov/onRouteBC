import { useCallback, useEffect, useMemo } from "react";
import { Policy } from "onroute-policy-engine";

import { PERMIT_TYPES, PermitType } from "../types/PermitType";
import { VehicleInConfiguration } from "../types/PermitVehicleConfiguration";
import { DEFAULT_COMMODITY_SELECT_VALUE } from "../constants/constants";

export const useVehicleConfiguration = (
  policyEngine: Policy,
  permitType: PermitType,
  selectedCommodity: string,
  selectedSubtypes: string[],
  selectedPowerUnitSubtype: string,
  onUpdateVehicleConfigTrailers:
    (updatedTrailerSubtypes: VehicleInConfiguration[]) => void,
) => {
  const getNextAllowedVehicleSubtypes = useCallback(
    (selectedCommodity: string, selectedSubtypes: string[]) => {
      const nextAllowedSubtypes = policyEngine.getNextPermittableVehicles(
        permitType,
        selectedCommodity,
        selectedSubtypes,
      );

      return [...nextAllowedSubtypes.entries()]
        .map(([subtypeCode, subtypeFullName]) => ({
          value: subtypeCode,
          label: subtypeFullName,
        }));
    },
    [policyEngine, permitType],
  );

  useEffect(() => {
    if (permitType === PERMIT_TYPES.STOS && selectedSubtypes.length > 0) {
      if ((selectedCommodity === DEFAULT_COMMODITY_SELECT_VALUE) || !policyEngine.isConfigurationValid(
        permitType,
        selectedCommodity,
        [selectedPowerUnitSubtype, ...selectedSubtypes],
        true,
      )) {
        onUpdateVehicleConfigTrailers([]);
      }
    }
  }, [
    permitType,
    policyEngine,
    selectedCommodity,
    selectedPowerUnitSubtype,
    selectedSubtypes,
    onUpdateVehicleConfigTrailers,
  ]);

  const nextAllowedSubtypes = useMemo(() => {
    if ((permitType !== PERMIT_TYPES.STOS)
      || !selectedCommodity
      || !selectedPowerUnitSubtype
      || (selectedCommodity === DEFAULT_COMMODITY_SELECT_VALUE)
    ) {
      return [];
    }

    const nextAllowed = getNextAllowedVehicleSubtypes(
      selectedCommodity,
      [selectedPowerUnitSubtype, ...selectedSubtypes],
    ).filter(({ value }) => !selectedSubtypes.includes(value));

    // Sort next allowed subtypes so that if the option "None" is present, it appears at the very beginning
    const hasNoneOption = nextAllowed.find(subtypeOption => subtypeOption.value === "NONEXXX");
    return hasNoneOption ? [
      hasNoneOption,
      ...nextAllowed.filter(({ value }) => value !== hasNoneOption.value),
    ] : nextAllowed;
  }, [
    selectedCommodity,
    selectedSubtypes,
    selectedPowerUnitSubtype,
    getNextAllowedVehicleSubtypes,
  ]);

  return {
    nextAllowedSubtypes,
  };
};
