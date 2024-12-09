import { COUNTRIES } from "../../constants/countries";
import { Nullable } from "../../types/common";
import { getDefaultRequiredVal } from "../util";

/**
 * Gets the full name of a province.
 * @param countryCode Country code
 * @param provinceCode Province code
 * @returns Full name of the province
 */
export const getProvinceFullName = (
  countryCode?: Nullable<string>,
  provinceCode?: Nullable<string>,
) => {
  if (!countryCode || !provinceCode) return "";

  const provincesOfCountry = getDefaultRequiredVal(
    [],
    COUNTRIES.find(country => country.code === countryCode)?.states,
  );

  return getDefaultRequiredVal(
    "",
    provincesOfCountry.find(province => province.code === provinceCode)?.name,
  );
};
