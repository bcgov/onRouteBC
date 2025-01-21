import { filterNonDigits } from "../numeric/filterNonDigits";
import { invalidPhoneLength } from "../validationMessages";

/**
 * Validate phone number.
 * @param phone Provided phone number to validate
 * @returns true if phone number is valid, otherwise returns error message
 */
export const validatePhoneNumber = (phone: string) => {
  const filteredPhone = filterNonDigits(phone);
  return (
    (filteredPhone.length >= 10 &&
      filteredPhone.length <= 20) ||
    invalidPhoneLength(10, 20)
  );
};
