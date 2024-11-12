export interface PermitCondition {
  description: string;
  condition: string;
  conditionLink: string;
  checked: boolean;
  disabled?: boolean;
}

export const arePermitConditionEqual = (
  condition1: PermitCondition,
  condition2: PermitCondition,
) => {
  return condition1.condition === condition2.condition
    && condition1.checked === condition2.checked;
};
