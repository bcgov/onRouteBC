import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

import "./PowerUnitForm.scss";
import { PowerUnit, VehicleSubType } from "../../types/Vehicle";
import { CountryAndProvince } from "../../../../common/components/form/CountryAndProvince";
import { CustomFormComponent } from "../../../../common/components/form/CustomFormComponents";
import { SnackBarContext } from "../../../../App";
import { VEHICLES_ROUTES } from "../../../../routes/constants";
import { Nullable } from "../../../../common/types/common";
import {
  usePowerUnitSubTypesQuery,
  useAddPowerUnitMutation,
  useUpdatePowerUnitMutation,
} from "../../hooks/powerUnits";

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

const FEATURE = "power-unit";

export const PowerUnitForm = ({
  companyId,
  powerUnit,
}: {
  companyId: number;
  powerUnit?: PowerUnit;
}) => {
  const isEditMode = Boolean(powerUnit?.powerUnitId);

  // If data was passed to this component, then use that data, otherwise set fields to empty
  const powerUnitDefaultValues = {
    provinceCode: getDefaultRequiredVal("", powerUnit?.provinceCode),
    countryCode: getDefaultRequiredVal("", powerUnit?.countryCode),
    unitNumber: getDefaultRequiredVal("", powerUnit?.unitNumber),
    licensedGvw: getDefaultNullableVal(powerUnit?.licensedGvw),
    make: getDefaultRequiredVal("", powerUnit?.make),
    plate: getDefaultRequiredVal("", powerUnit?.plate),
    powerUnitTypeCode: getDefaultRequiredVal("", powerUnit?.powerUnitTypeCode),
    steerAxleTireSize: getDefaultNullableVal(powerUnit?.steerAxleTireSize),
    vin: getDefaultRequiredVal("", powerUnit?.vin),
    year: getDefaultNullableVal(powerUnit?.year),
  };

  const formMethods = useForm<PowerUnit>({
    defaultValues: powerUnitDefaultValues,
    reValidateMode: "onBlur",
  });

  const { handleSubmit } = formMethods;

  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const addPowerUnitMutation = useAddPowerUnitMutation();
  const updatePowerUnitMutation = useUpdatePowerUnitMutation();
  const snackBar = useContext(SnackBarContext);
  const navigate = useNavigate();

  // Saving a vehicle
  const onAddOrUpdateVehicle = async (data: FieldValues) => {
    if (isEditMode) {
      const powerUnitToBeUpdated = data as PowerUnit;
      const result = await updatePowerUnitMutation.mutateAsync({
        companyId,
        powerUnitId: (powerUnit as PowerUnit).powerUnitId as string,
        powerUnit: {
          ...powerUnitToBeUpdated,
          // need to explicitly convert form values to number here (since we can't use valueAsNumber prop)
          year: convertToNumberIfValid(data.year, data.year as string) as any,
          licensedGvw: convertToNumberIfValid(
            data.licensedGvw,
            data.licensedGvw as string,
          ) as any,
          steerAxleTireSize: convertToNumberIfValid(
            data.steerAxleTireSize,
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

        navigate(VEHICLES_ROUTES.MANAGE);
      }
    } else {
      const powerUnitToBeAdded = data as PowerUnit;
      const result = await addPowerUnitMutation.mutateAsync({
        companyId,
        powerUnit: {
          ...powerUnitToBeAdded,
          // need to explicitly convert form values to number here (since we can't use valueAsNumber prop)
          year: !isNaN(Number(data.year)) ? Number(data.year) : data.year,
          licensedGvw:
            data.licensedGvw != null &&
            data.licensedGvw !== "" &&
            !isNaN(Number(data.licensedGvw))
              ? Number(data.licensedGvw)
              : data.licensedGvw,
          steerAxleTireSize: convertToNumberIfValid(
            data.steerAxleTireSize,
            null,
          ) as Nullable<number>,
        },
      });

      if (result.status === 200 || result.status === 201) {
        snackBar.setSnackBar({
          showSnackbar: true,
          setShowSnackbar: () => true,
          message: "Power unit has been added successfully",
          alertType: "success",
        });

        navigate(VEHICLES_ROUTES.MANAGE);
      }
    }
  };

  // Go back to the main Vehicle Inventory page on close
  const handleClose = () => {
    navigate(VEHICLES_ROUTES.MANAGE);
  };

  const saveButtonText = isEditMode ? "Save" : "Add To Inventory";

  return (
    <FormProvider {...formMethods}>
      <div className="power-unit-form">
        <div className="power-unit-form__section">
          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "unitNumber",
              rules: { required: false, maxLength: 10 },
              label: "Unit #",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "make",
              rules: {
                required: { value: true, message: requiredMessage() },
                maxLength: 20,
              },
              label: "Make",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            onFocus={disableMouseWheelInputOnNumberField}
            options={{
              name: "year",
              rules: {
                required: { value: true, message: requiredMessage() },
                maxLength: 4,
                validate: {
                  isNumber: (v) => !isNaN(v) || invalidNumber(),
                  lessThan1950: (v) =>
                    parseInt(v) > 1950 || invalidYearMin(1950),
                },
              },
              inputType: "number",
              label: "Year",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "vin",
              rules: {
                required: { value: true, message: requiredMessage() },
                minLength: { value: 6, message: invalidVINLength(6) },
                maxLength: 6,
              },
              label: "VIN",
              customHelperText: "last 6 digits",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "plate",
              rules: {
                required: { value: true, message: requiredMessage() },
                maxLength: { value: 10, message: invalidPlateLength(10) },
              },
              label: "Plate",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="select"
            feature={FEATURE}
            options={{
              name: "powerUnitTypeCode",
              rules: {
                required: {
                  value: true,
                  message: requiredMessage(),
                },
              },
              label: "Vehicle Sub-type",
            }}
            menuOptions={powerUnitSubTypesQuery?.data?.map(
              (data: VehicleSubType) => (
                <MenuItem key={data.typeCode} value={data.typeCode}>
                  {data.type}
                </MenuItem>
              ),
            )}
            className="power-unit-form__field"
          />

          <CountryAndProvince
            feature={FEATURE}
            countryField="countryCode"
            provinceField="provinceCode"
            isProvinceRequired={true}
            provinceClassName="power-unit-form__field"
            countryClassName="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "licensedGvw",
              rules: {
                required: { value: true, message: requiredMessage() },
                validate: {
                  isNumber: (v) => !isNaN(v) || invalidNumber(),
                },
              },
              inputType: "number",
              label: "Licensed GVW",
            }}
            className="power-unit-form__field"
          />

          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "steerAxleTireSize",
              rules: {
                required: false,
                pattern: {
                  value: /^\d+$/,
                  message: invalidNumber(),
                },
              },
              label: "Steer Axle Tire Size (mm)",
            }}
            className="power-unit-form__field"
          />
        </div>

        <Box className="power-unit-form__actions">
          <Button
            key="cancel-save-vehicle-button"
            aria-label="Cancel"
            variant="contained"
            color="secondary"
            onClick={handleClose}
            className="power-unit-form__action-btn power-unit-form__action-btn--cancel"
          >
            Cancel
          </Button>

          <Button
            key="save-vehicle-button"
            aria-label={saveButtonText}
            variant="contained"
            color="primary"
            onClick={handleSubmit(onAddOrUpdateVehicle)}
            className="power-unit-form__action-btn power-unit-form__action-btn--submit"
          >
            {saveButtonText}
          </Button>
        </Box>
      </div>
    </FormProvider>
  );
};
