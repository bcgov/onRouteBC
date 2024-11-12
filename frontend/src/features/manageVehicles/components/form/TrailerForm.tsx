import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

import "./TrailerForm.scss";
import { Trailer, VehicleSubType } from "../../types/Vehicle";
import { CountryAndProvince } from "../../../../common/components/form/CountryAndProvince";
import { CustomFormComponent } from "../../../../common/components/form/CustomFormComponents";
import { SnackBarContext } from "../../../../App";
import { VEHICLES_ROUTES } from "../../../../routes/constants";
import { Nullable } from "../../../../common/types/common";
import {
  useTrailerSubTypesQuery,
  useAddTrailerMutation,
  useUpdateTrailerMutation,
} from "../../hooks/trailers";

import {
  getDefaultRequiredVal,
  getDefaultNullableVal,
  convertToNumberIfValid,
} from "../../../../common/helpers/util";

import {
  invalidNumber,
  invalidPlateLength,
  invalidVINLength,
  invalidYearMin,
  requiredMessage,
} from "../../../../common/helpers/validationMessages";
import { disableMouseWheelInputOnNumberField } from "../../../../common/helpers/disableMouseWheelInputOnNumberField";

const FEATURE = "trailer";

export const TrailerForm = ({
  companyId,
  trailer,
}: {
  companyId: number;
  trailer?: Trailer;
}) => {
  const isEditMode = Boolean(trailer?.trailerId);

  // If data was passed to this component, then use that data, otherwise set fields to empty
  const trailerDefaultValues = {
    provinceCode: getDefaultRequiredVal("", trailer?.provinceCode),
    countryCode: getDefaultRequiredVal("", trailer?.countryCode),
    unitNumber: getDefaultRequiredVal("", trailer?.unitNumber),
    make: getDefaultRequiredVal("", trailer?.make),
    plate: getDefaultRequiredVal("", trailer?.plate),
    trailerTypeCode: getDefaultRequiredVal("", trailer?.trailerTypeCode),
    vin: getDefaultRequiredVal("", trailer?.vin),
    year: getDefaultNullableVal(trailer?.year),
    emptyTrailerWidth: getDefaultNullableVal(trailer?.emptyTrailerWidth),
  };

  const formMethods = useForm<Trailer>({
    defaultValues: trailerDefaultValues,
    reValidateMode: "onBlur",
  });

  const { handleSubmit } = formMethods;

  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const addTrailerMutation = useAddTrailerMutation();
  const updateTrailerMutation = useUpdateTrailerMutation();
  const snackBar = useContext(SnackBarContext);
  const navigate = useNavigate();

  const onAddOrUpdateVehicle = async (data: FieldValues) => {
    if (isEditMode) {
      const trailerToBeUpdated = data as Trailer;
      const result = await updateTrailerMutation.mutateAsync({
        companyId,
        trailerId: (trailer as Trailer).trailerId as string,
        trailer: {
          ...trailerToBeUpdated,
          // need to explicitly convert form values to number here (since we can't use valueAsNumber prop)
          year: !isNaN(Number(data.year)) ? Number(data.year) : data.year,
          emptyTrailerWidth: convertToNumberIfValid(
            data.emptyTrailerWidth,
            null,
          ) as Nullable<number>,
        },
      });
      if (result.status === 200) {
        snackBar.setSnackBar({
          showSnackbar: true,
          setShowSnackbar: () => true,
          message: "Changes Saved",
          alertType: "info",
        });
        navigate(VEHICLES_ROUTES.TRAILER_TAB);
      }
    } else {
      const trailerToBeAdded = data as Trailer;
      const result = await addTrailerMutation.mutateAsync({
        companyId,
        trailer: {
          ...trailerToBeAdded,
          // need to explicitly convert form values to number here (since we can't use valueAsNumber prop)
          year: !isNaN(Number(data.year)) ? Number(data.year) : data.year,
          emptyTrailerWidth: convertToNumberIfValid(
            data.emptyTrailerWidth,
            null,
          ) as Nullable<number>,
        },
      });

      if (result.status === 200 || result.status === 201) {
        snackBar.setSnackBar({
          showSnackbar: true,
          setShowSnackbar: () => true,
          message: "Trailer has been added successfully",
          alertType: "success",
        });
        navigate(VEHICLES_ROUTES.TRAILER_TAB);
      }
    }
  };

  // Go back to the main Vehicle Inventory page on close
  const handleClose = () => {
    navigate(VEHICLES_ROUTES.TRAILER_TAB);
  };

  const saveButtonText = isEditMode ? "Save" : "Add To Inventory";

  return (
    <FormProvider {...formMethods}>
      <div className="trailer-form">
        <div className="trailer-form__section">
          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "unitNumber",
              rules: { required: false, maxLength: 10 },
              label: "Unit #",
            }}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "make",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
                maxLength: 20,
              },
              label: "Make",
            }}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            onFocus={disableMouseWheelInputOnNumberField}
            options={{
              name: "year",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
                validate: {
                  isNumber: (v) => !isNaN(v) || invalidNumber(),
                  lessThan1950: (v) =>
                    parseInt(v) > 1950 || invalidYearMin(1950),
                },
                maxLength: 4,
              },
              inputType: "number",
              label: "Year",
            }}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "vin",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
                minLength: {
                  value: 6,
                  message: invalidVINLength(6),
                },
                maxLength: 6,
              },
              label: "VIN",
              customHelperText: "last 6 digits",
            }}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "plate",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
                maxLength: {
                  value: 10,
                  message: invalidPlateLength(10),
                },
              },
              label: "Plate",
            }}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="select"
            feature={FEATURE}
            options={{
              name: "trailerTypeCode",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
              },
              label: "Vehicle Sub-type",
            }}
            menuOptions={trailerSubTypesQuery?.data?.map(
              (data: VehicleSubType) => (
                <MenuItem key={data.typeCode} value={data.typeCode}>
                  {data.type}
                </MenuItem>
              ),
            )}
            className="trailer-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "emptyTrailerWidth",
              rules: {
                required: false,
                maxLength: 10,
                validate: {
                  isNumber: (v) => !isNaN(v) || invalidNumber(),
                },
              },
              label: "Empty Trailer Width (m)",
            }}
            className="trailer-form__field"
          />

          <CountryAndProvince
            feature={FEATURE}
            countryField="countryCode"
            provinceField="provinceCode"
            isProvinceRequired={true}
            countryClassName="trailer-form__field"
            provinceClassName="trailer-form__field"
          />
        </div>

        <Box className="trailer-form__actions">
          <Button
            key="cancel-save-vehicle-button"
            aria-label="Cancel"
            variant="contained"
            color="secondary"
            onClick={handleClose}
            className="trailer-form__action-btn trailer-form__action-btn--cancel"
          >
            Cancel
          </Button>

          <Button
            key="save-vehicle-button"
            aria-label={saveButtonText}
            variant="contained"
            color="primary"
            onClick={handleSubmit(onAddOrUpdateVehicle)}
            className="trailer-form__action-btn trailer-form__action-btn--submit"
          >
            {saveButtonText}
          </Button>
        </Box>
      </div>
    </FormProvider>
  );
};
