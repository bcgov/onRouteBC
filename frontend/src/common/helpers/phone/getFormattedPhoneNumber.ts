import { Nullable } from "../../types/common";
import { filterNonDigits } from "../numeric/filterNonDigits";

/**
 * Get the formatted phone number from a provided phone number string.
 * @param input Inputted string that could contain phone number
 * @returns Formatted phone number
 */
export const getFormattedPhoneNumber = (input?: Nullable<string>): string => {
  if (!input) return "";

  // Only accept digits as part of phone numbers
  const parsedPhoneDigits: string = filterNonDigits(input);
  const phoneDigitsLength = parsedPhoneDigits.length;

  // Ignore formatting if the value length is greater than a standard Canada/US phone number
  // (11 digits including country code)
  if (phoneDigitsLength > 11) {
    return parsedPhoneDigits;
  }

  // If there are no digits in the resulting parsed phone number, return ""
  if (phoneDigitsLength < 1) return parsedPhoneDigits;

  // If there are 1-3 digits in the parsed phone number, return them as is
  // ie. "x", "xx", or "xxx"
  if (phoneDigitsLength < 4) return `${parsedPhoneDigits.slice(0, 3)}`;

  // If there are 4-6 digits in the parsed phone number, return the first 3 digits as area code (in brackets followed by space)
  // followed by the rest of the digits as just digits with no formatting
  // ie. "(xxx) x", "(xxx) xx", "(xxx) xxx",
  if (phoneDigitsLength < 7)
    return `(${parsedPhoneDigits.slice(0, 3)}) ${parsedPhoneDigits.slice(3)}`;

  // If there are 7-10 digits, return the first 6 digits based on the above formatting rules,
  // followed by a dash and the remaining digits will be unformatted
  // ie. "(xxx) xxx-x", "(xxx) xxx-xx", "(xxx) xxx-xxx", "(xxx) xxx-xxxx"
  if (phoneDigitsLength < 11)
    return `(${parsedPhoneDigits.slice(0, 3)}) ${parsedPhoneDigits.slice(
      3,
      6,
    )}-${parsedPhoneDigits.slice(6, 10)}`;

  // With exactly 11 digits, format the phone number like this: "+x (xxx) xxx-xxxx"
  return `+${parsedPhoneDigits.slice(0, 1)} (${parsedPhoneDigits.slice(
    1,
    4,
  )}) ${parsedPhoneDigits.slice(4, 7)}-${parsedPhoneDigits.slice(7, 11)}`;
};
