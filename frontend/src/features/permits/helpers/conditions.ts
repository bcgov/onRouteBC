import { isVehicleSubtypeLCV } from "../../manageVehicles/helpers/vehicleSubtypes";
import { LCV_CONDITION } from "../constants/constants";
import { MANDATORY_TROS_CONDITIONS, TROS_CONDITIONS } from "../constants/tros";
import { MANDATORY_TROW_CONDITIONS, TROW_CONDITIONS } from "../constants/trow";
import { PermitCondition } from "../types/PermitCondition";
import { PERMIT_TYPES, PermitType } from "../types/PermitType";

/**
 * Get mandatory conditions that must be selected for a permit type.
 * @param permitType Permit type to get the conditions for
 * @param includeLcvCondition Whether or not to include LCV condition
 * @returns Mandatory conditions that will be automatically selected
 */
export const getMandatoryConditions = (
  permitType: PermitType,
  includeLcvCondition?: boolean,
) => {
  const additionalConditions = includeLcvCondition ? [LCV_CONDITION] : [];
  switch (permitType) {
    case PERMIT_TYPES.TROW:
      return MANDATORY_TROW_CONDITIONS.concat(additionalConditions);
    case PERMIT_TYPES.TROS:
      return MANDATORY_TROS_CONDITIONS.concat(additionalConditions);
    default:
      return additionalConditions;
  }
};

const getConditionsByPermitType = (
  permitType: PermitType,
  includeLcvCondition?: boolean,
) => {
  const additionalConditions = includeLcvCondition ? [LCV_CONDITION] : [];
  switch (permitType) {
    case PERMIT_TYPES.TROW:
      return TROW_CONDITIONS.concat(additionalConditions);
    case PERMIT_TYPES.TROS:
      return TROS_CONDITIONS.concat(additionalConditions);
    default:
      return additionalConditions;
  }
};

const isConditionMandatory = (
  condition: PermitCondition,
  mandatoryConditions: PermitCondition[],
) => {
  return mandatoryConditions
    .map(mandatoryCondition => mandatoryCondition.condition)
    .includes(condition.condition);
};

/**
 * Get sorted list of permit conditions, ordered from mandatory (disabled) to selectable ones.
 * @param conditions List of possibly unsorted permit conditions
 * @returns Sorted list of permit conditions, from mandatory to selectable ones
 */
export const sortConditions = (conditions: PermitCondition[]) => {
  return [...conditions].sort((condition1, condition2) => {
    if (condition1.disabled && condition2.disabled) return 0;
    if (!condition1.disabled && !condition2.disabled) return 0;
    return condition1.disabled && !condition2.disabled ? -1 : 1;
  });
};

/**
 * Get default conditions (in their initial states) for a permit/application form.
 * @param permitType Permit type to get the conditions for
 * @param includeLcvCondition Whether or not to include LCV condition
 * @returns Default conditions for a given permit type
 */
export const getDefaultConditions = (
  permitType: PermitType,
  includeLcvCondition?: boolean,
) => {
  const mandatoryConditions = getMandatoryConditions(permitType, includeLcvCondition);

  return sortConditions(
    getConditionsByPermitType(permitType, includeLcvCondition).map((condition) => ({
      ...condition,
      // must-select options are checked and disabled (for toggling) by default
      checked: isConditionMandatory(condition, mandatoryConditions),
      disabled: isConditionMandatory(condition, mandatoryConditions),
    })),
  );
};

/**
 * Get updated permit conditions based on LCV designation and selected vehicle subtype.
 * @param isLcvDesignated Whether or not the LCV designation is to be used
 * @param prevSelectedConditions Previously selected permit conditions
 * @param vehicleSubtype Selected vehicle subtype
 * @returns Updated permit conditions
 */
export const getUpdatedConditionsForLCV = (
  isLcvDesignated: boolean,
  prevSelectedConditions: PermitCondition[],
  vehicleSubtype: string,
) => {
  if (!isLcvDesignated) {
    // If LCV not designated, remove LCV condition
    return prevSelectedConditions.filter(
      ({ condition }: PermitCondition) => condition !== LCV_CONDITION.condition,
    );
  }
  
  // If LCV is designated, and vehicle subtype isn't LCV but conditions have LCV,
  // then remove that LCV condition
  if (
    !isVehicleSubtypeLCV(vehicleSubtype)
    && prevSelectedConditions.some(({ condition }) => condition === LCV_CONDITION.condition)
  ) {
    return prevSelectedConditions.filter(
      ({ condition }: PermitCondition) => condition !== LCV_CONDITION.condition,
    );
  }

  // If LCV is designated, and vehicle subtype is LCV but conditions don't have LCV,
  // then add that LCV condition
  if (
    isVehicleSubtypeLCV(vehicleSubtype)
    && !prevSelectedConditions.some(({ condition }) => condition === LCV_CONDITION.condition)
  ) {
    return sortConditions([...prevSelectedConditions, LCV_CONDITION]);
  }

  // In other cases, the conditions are valid
  return prevSelectedConditions;
};

/**
 * Get permit condition selection state, including all selected, unselected, and disabled conditions.
 * @param permitType Permit type
 * @param isLcvDesignated Whether or not the LCV designation is to be used
 * @param vehicleSubtype Selected vehicle subtype
 * @param prevSelectedConditions Previously selected permit conditions
 * @returns Permit condition selection state
 */
export const getPermitConditionSelectionState = (
  permitType: PermitType,
  isLcvDesignated: boolean,
  vehicleSubtype: string,
  prevSelectedConditions: PermitCondition[],
): PermitCondition[] => {
  const defaultConditionsForPermitType = getDefaultConditions(
    permitType,
    isLcvDesignated && isVehicleSubtypeLCV(vehicleSubtype),
  );

  const updatedConditionsInForm = getUpdatedConditionsForLCV(
    isLcvDesignated,
    prevSelectedConditions,
    vehicleSubtype,
  );

  return defaultConditionsForPermitType.map((defaultCondition) => {
    // Select all conditions that were previously selected
    const existingCondition = updatedConditionsInForm.find(
      (c) => c.condition === defaultCondition.condition,
    );

    return {
      ...defaultCondition,
      checked: existingCondition
        ? existingCondition.checked
        : defaultCondition.checked,
    };
  });
};
