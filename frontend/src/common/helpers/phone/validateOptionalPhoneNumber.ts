import { Nullable } from "../../types/common";
import { validatePhoneNumber } from "./validatePhoneNumber";

/**
 * Validate an optional phone number.
 * @param phone Provided phone number, if any
 * @returns true if phone number is valid or empty, error message otherwise
 */
export const validateOptionalPhoneNumber = (phone?: Nullable<string>) => {
  if (!phone) return true; // phone number is optional, so empty is accepted

  return validatePhoneNumber(phone);
};