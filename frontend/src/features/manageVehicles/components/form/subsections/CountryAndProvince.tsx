import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ".././VehicleForm.scss";
import FormHelperText from "@mui/material/FormHelperText";
import { useCallback, useState } from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { COUNTRIES_THAT_SUPPORT_PROVINCE } from "../../../../../constants/countries";

import CountriesAndStates from "../../../../../constants/countries_and_states.json";

/**
 * The props that can be passed to the country and provinces subsection of a form.
 */
interface CountryAndProvinceProps {
  /**
   * The value for the country field.
   * Default value is ''
   */
  country?: string | null;

  /**
   * The value for the province field.
   * Default value is ''
   */
  province?: string | null;
}

/**
 * The CountryAndProvince component provides form fields for country and province.
 * This implementation uses {@link  COUNTRIES_THAT_SUPPORT_PROVINCE} to display or hide
 * the province field.
 *
 * @returns A react component with the country and province fields.
 */
export const CountryAndProvince = ({
  country,
  province,
}: CountryAndProvinceProps) => {
  const {
    register,
    resetField,
    watch,
    setValue,
    getValues,
    control,
  } = useFormContext();

  /**
   * State for displaying selected province
   */
  const [selectedProvince, setSelectedProvince] = useState<string>(
    province || ""
  );
  const [shouldDisplayProvince, setShouldDisplayProvince] =
    useState<boolean>(true);

  const countrySelected = watch("country");
  /**
   * Custom css overrides for the form fields
   */
  const formFieldStyle = {
    fontWeight: "bold",
    width: "300px",
  };

  /**
   * Function to handle changes on selecting a country.
   * When the selected country supports provinces, provinces are displayed.
   * Otherwise, the province field is hidden.
   * @param event the select event
   */
  const onChangeCountry = useCallback(function (event: SelectChangeEvent) {
    const country: string = event.target.value as string;
    resetField("province", { defaultValue: "" });
    setSelectedProvince(() => "");
    if (
      !COUNTRIES_THAT_SUPPORT_PROVINCE.find(
        (supportedCountry) => supportedCountry === country
      )
    ) {
      // If country does not support province, as per API spec, set country to province too
      // even though the field is hidden.
      setShouldDisplayProvince(() => false);
      setValue("province", country);
      setValue("provinceId", country + "-" + country);
    } else {
      setShouldDisplayProvince(() => true);
    }
  }, []);

  /**
   * Function to handle changes on selecting a province/state.
   * @param event the select event
   */
  const onChangeProvince = useCallback(function (event: SelectChangeEvent) {
    resetField("provinceId", { defaultValue: "" });
    const provinceSelected: string = event.target.value;
    setSelectedProvince(() => event.target.value as string);

    setValue("provinceId", getValues("country") + "-" + provinceSelected);
  }, []);

  /**
   * Returns the list of provinces for the country selected.
   * @param selectedCountry string representing the country
   */
  const getProvinces = useCallback(function (selectedCountry: string) {
    return CountriesAndStates.filter(
      (country) => country.code === selectedCountry
    ).flatMap((country) => country.states);
  }, []);

  const { t } = useTranslation();
  return (
    <div>
      <div>
        <Controller
          key="controller-powerunit-country"
          name="country"
          control={control}
          rules={{ required: true }}
          defaultValue={country || ""}
          render={({ fieldState: { invalid } }) => (
            <>
              <FormControl margin="normal" error={invalid}>
                <FormLabel id="power-unit-country-label" sx={formFieldStyle}>
                  {t("vehicle.power-unit.country")}
                </FormLabel>
                <Select
                  aria-labelledby="power-unit-country-label"
                  defaultValue={country || ""}
                  {...register("country", {
                    required: true,
                    onChange: onChangeCountry,
                  })}
                >
                  {CountriesAndStates.map((country) => (
                    <MenuItem
                      key={`country-${country.name}`}
                      value={country.code}
                    >
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
                {invalid && (
                  <FormHelperText error>
                    {t("vehicle.power-unit.required", { fieldName: "Country" })}
                  </FormHelperText>
                )}
              </FormControl>
            </>
          )}
        />
      </div>
      {shouldDisplayProvince && (
        <div>
          <Controller
            key=""
            name=""
            rules={{ required: shouldDisplayProvince }}
            defaultValue={country || ""}
            render={({ fieldState: { invalid } }) => (
              <>
                <FormControl
                  margin="normal"
                  error={invalid}
                >
                  <FormLabel id="power-unit-province-label" sx={formFieldStyle}>
                    {t("vehicle.power-unit.province")}
                  </FormLabel>
                  <Select
                    aria-labelledby="power-unit-province-label"
                    defaultValue={province || ""}
                    {...register("province", {
                      required: shouldDisplayProvince,
                      onChange: onChangeProvince,
                    })}
                    value={selectedProvince}
                  >
                    {getProvinces(countrySelected).map((state) => (
                      <MenuItem
                        key={`state-${state?.code}`}
                        value={state?.code}
                      >
                        {state?.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {invalid && (
                    <FormHelperText error>
                      {t("vehicle.power-unit.required", {
                        fieldName: "Province/State",
                      })}
                    </FormHelperText>
                  )}
                </FormControl>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
};
