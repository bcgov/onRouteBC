import { useFormContext, FieldPath } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { COUNTRIES } from "../../constants/countries";
import { countrySupportsProvinces } from "../../helpers/countries/countrySupportsProvinces";
import { DEFAULT_WIDTH } from "../../../themes/bcGovStyles";
import { CustomFormComponent } from "./CustomFormComponents";
import { Nullable, ORBC_FormTypes } from "../../types/common";
import {
  invalidCountryCode,
  invalidProvinceCode,
  requiredMessage,
} from "../../helpers/validationMessages";

interface CountryAndProvinceProps {
  feature: string;
  width?: string;
  countryField: string;
  provinceField: string;
  isCountryRequired?: boolean;
  isProvinceRequired?: boolean;
  countryClassName?: string;
  provinceClassName?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

/**
 * The CountryAndProvince component provides form fields for country and province.
 * @returns A react component with the country and province fields.
 */
export const CountryAndProvince = <T extends ORBC_FormTypes>({
  feature,
  width = DEFAULT_WIDTH,
  countryField,
  isCountryRequired = true,
  provinceField,
  isProvinceRequired = true,
  countryClassName,
  provinceClassName,
  disabled,
  readOnly,
}: CountryAndProvinceProps): JSX.Element => {
  const { resetField, watch, setValue } = useFormContext();
  const countrySelected = watch(countryField);
  const provinceSelected = watch(provinceField);

  const [shouldDisplayProvince, setShouldDisplayProvince] =
    useState<boolean>(true);

  useEffect(() => {
    handleDisplayProvince(countrySelected, provinceSelected);
  }, [countrySelected, provinceSelected]);

  /**
   * When the selected country supports provinces, provinces are displayed.
   * Otherwise, the province field is hidden.
   * @param country string
   * @param province optional string
   */
  const handleDisplayProvince = (
    country: string,
    province: Nullable<string>,
  ) => {
    if (!country) {
      // If country is not selected (empty)
      setShouldDisplayProvince(() => true);
      resetField(provinceField, { defaultValue: "" });
    } else if (!countrySupportsProvinces(country)) {
      // If country does not support province, as per API spec, set country to province too
      // even though the field is hidden.
      setShouldDisplayProvince(() => false);
      resetField(provinceField, { defaultValue: "" });
    } else {
      setShouldDisplayProvince(() => true);
      const provincesOfCountry = getProvinces(country);
      if (
        province &&
        provincesOfCountry.find((prov) => prov.code === province)
      ) {
        setValue(provinceField, province);
      } else {
        // Reset province once country changes
        resetField(provinceField, { defaultValue: "" });
      }
    }
  };

  /**
   * Function to handle changes on selecting a country when the user manually changes the select dropdown field.
   * @param event the select event
   */
  const onChangeCountry = useCallback(function (event: SelectChangeEvent) {
    const country = String(event.target.value);
    handleDisplayProvince(country, undefined);
  }, []);

  /**
   * Returns the list of provinces for the country selected.
   * @param selectedCountry string representing the country
   */
  const getProvinces = useCallback(function (selectedCountry: string) {
    return COUNTRIES.filter(
      (country) => country.code === selectedCountry,
    ).flatMap((country) => country.states);
  }, []);

  const updatedCountryRules = {
    required: {
      value: isCountryRequired,
      message: requiredMessage(),
    },
    validate: {
      validateCountry: (country?: string) =>
        (!isCountryRequired && (country == null || country === "")) ||
        (country != null && country !== "" && /^[A-Z]{2}$/.test(country)) ||
        invalidCountryCode(),
    },
    onChange: onChangeCountry,
  };

  const updatedProvinceRules = {
    required: {
      value: shouldDisplayProvince && isProvinceRequired,
      message: requiredMessage(),
    },
    validate: {
      validateProvince: (province?: string) =>
        (!isProvinceRequired && (province == null || province === "")) ||
        (province != null && province !== "" && /^[A-Z]{2}$/.test(province)) ||
        invalidProvinceCode(),
    },
  };

  return (
    <>
      <CustomFormComponent
        type="select"
        feature={feature}
        options={{
          name: countryField as FieldPath<T>,
          rules: updatedCountryRules,
          label: "Country",
          width: width,
        }}
        menuOptions={COUNTRIES.map((country) => (
          <MenuItem key={`country-${country.name}`} value={country.code}>
            {country.name}
          </MenuItem>
        ))}
        className={countryClassName}
        disabled={disabled}
        readOnly={readOnly}
      />

      {shouldDisplayProvince && (
        <CustomFormComponent
          type="select"
          feature={feature}
          options={{
            name: provinceField as FieldPath<T>,
            rules: updatedProvinceRules,
            label: "Province / State",
            width: width,
          }}
          menuOptions={getProvinces(countrySelected).map((state) => (
            <MenuItem key={`state-${state?.code}`} value={state?.code}>
              {state?.name}
            </MenuItem>
          ))}
          className={provinceClassName}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}
    </>
  );
};
