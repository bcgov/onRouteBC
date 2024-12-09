import { COUNTRIES } from "../../constants/countries";
import { Nullable } from "../../types/common";
import { getDefaultRequiredVal } from "../util";

/**
 * Determines whether or not the country provided by the code supports provinces.
 * @param countryCode Country code
 * @returns Whether or not the country supports provinces
 */
export const countrySupportsProvinces = (countryCode?: Nullable<string>) => {
  return getDefaultRequiredVal(
    [],
    COUNTRIES.find(country => country.code === countryCode)?.states,
  ).length > 0;
};
