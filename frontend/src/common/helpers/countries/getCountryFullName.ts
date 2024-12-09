import { COUNTRIES } from "../../constants/countries";
import { Nullable } from "../../types/common";
import { getDefaultRequiredVal } from "../util";

/**
 * Gets the full name of a country.
 * @param countryCode Country code
 * @returns Full name of the country
 */
export const getCountryFullName = (countryCode?: Nullable<string>) => {
  if (!countryCode) return "";

  return getDefaultRequiredVal(
    "",
    COUNTRIES.find(c => c.code === countryCode)?.name,
  );
};
