import { isNull, isUndefined, Nullable } from "../../types/common";

/**
 * Converts a numeric value to a number if possible.
 * @param numericVal The numeric value (can be number or string)
 * @param fallbackWhenInvalid The value to return if invalid.
 * @returns The converted number value, or fallback value when invalid
 */
export const convertToNumberIfValid = <T extends Nullable<number | string>>(
  numericVal?: Nullable<string | number>,
  fallbackWhenInvalid?: T,
) => {
  const isNullable = isNull(numericVal) || isUndefined(numericVal);
  const isNumberButInvalid = (typeof numericVal === "number") && isNaN(numericVal);
  const isStringButInvalid = (typeof numericVal === "string")
    && (numericVal.trim() === "" || isNaN(Number(numericVal.trim())));
  
  const isInvalid = isNullable
    || ((typeof numericVal !== "number") && (typeof numericVal !== "string"))
    || isNumberButInvalid
    || isStringButInvalid;
  
  return !isInvalid ? Number(numericVal) : fallbackWhenInvalid as T;
};
