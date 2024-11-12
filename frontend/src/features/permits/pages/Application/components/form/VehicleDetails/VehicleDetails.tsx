import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

import "./VehicleDetails.scss";
import { CountryAndProvince } from "../../../../../../../common/components/form/CountryAndProvince";
import { CustomFormComponent } from "../../../../../../../common/components/form/CustomFormComponents";
import { InfoBcGovBanner } from "../../../../../../../common/components/banners/InfoBcGovBanner";
import { mapToVehicleObjectById } from "../../../../../helpers/mappers";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { CustomInputHTMLAttributes } from "../../../../../../../common/types/formElements";
import { SelectUnitOrPlate } from "./customFields/SelectUnitOrPlate";
import { SelectVehicleDropdown } from "./customFields/SelectVehicleDropdown";
import { BANNER_MESSAGES } from "../../../../../../../common/constants/bannerMessages";
import { PermitVehicleDetails } from "../../../../../types/PermitVehicleDetails";
import { selectedVehicleSubtype } from "../../../../../../manageVehicles/helpers/vehicleSubtypes";
import { disableMouseWheelInputOnNumberField } from "../../../../../../../common/helpers/disableMouseWheelInputOnNumberField";
import {
  PowerUnit,
  Trailer,
  VehicleSubType,
  VEHICLE_TYPES,
  Vehicle,
  VehicleType,
} from "../../../../../../manageVehicles/types/Vehicle";

import {
  CHOOSE_FROM_OPTIONS,
  VEHICLE_CHOOSE_FROM,
  VEHICLE_TYPE_OPTIONS,
  VehicleChooseFrom,
} from "../../../../../constants/constants";

import {
  invalidNumber,
  invalidPlateLength,
  invalidVINLength,
  invalidYearMin,
  requiredMessage,
} from "../../../../../../../common/helpers/validationMessages";

export const VehicleDetails = ({
  feature,
  vehicleFormData,
  vehicleOptions,
  subtypeOptions,
  isSelectedLOAVehicle,
  onSetSaveVehicle,
  onSetVehicle,
  onClearVehicle,
}: {
  feature: string;
  vehicleFormData: PermitVehicleDetails;
  vehicleOptions: Vehicle[];
  subtypeOptions: VehicleSubType[];
  isSelectedLOAVehicle: boolean;
  onSetSaveVehicle: (saveVehicle: boolean) => void;
  onSetVehicle: (vehicleDetails: PermitVehicleDetails) => void;
  onClearVehicle: (saveVehicle: boolean) => void;
}) => {
  const formFieldStyle = {
    fontWeight: "bold",
    width: "490px",
    marginLeft: "8px",
  };

  const vehicleType = vehicleFormData.vehicleType;

  // Choose vehicle based on either Unit Number or Plate
  const [chooseFrom, setChooseFrom] = useState<VehicleChooseFrom>(
    VEHICLE_CHOOSE_FROM.UNIT_NUMBER,
  );

  // Radio button value to decide if the user wants to save the vehicle in inventory
  // Reset to false every reload
  const [saveVehicle, setSaveVehicle] = useState<boolean>(false);

  // Disable vehicle type selection when a vehicle has been selected from dropdown
  // Enable only when user chooses to manually enter new vehicle info by clearing the vehicle details
  const shouldDisableVehicleTypeSelect = () => {
    const existingVehicle = vehicleType
      ? mapToVehicleObjectById(
          vehicleOptions,
          vehicleType as VehicleType,
          vehicleFormData.vehicleId,
        )
      : undefined;

    return Boolean(existingVehicle);
  };

  const disableVehicleTypeSelect = shouldDisableVehicleTypeSelect();

  // Set the "Save to Inventory" radio button to false on render
  useEffect(() => {
    onSetSaveVehicle(saveVehicle);
  }, [saveVehicle]);

  // Whenever a new vehicle is selected
  const onSelectVehicle = (selectedVehicle: Vehicle) => {
    const vehicleType =
      selectedVehicle.vehicleType === VEHICLE_TYPES.TRAILER
        ? VEHICLE_TYPES.TRAILER
        : VEHICLE_TYPES.POWER_UNIT;

    const vehicleId =
      vehicleType === VEHICLE_TYPES.POWER_UNIT
        ? (selectedVehicle as PowerUnit).powerUnitId
        : (selectedVehicle as Trailer).trailerId;

    const vehicle = mapToVehicleObjectById(
      vehicleOptions,
      vehicleType,
      vehicleId,
    );

    if (!vehicle) {
      // vehicle selection is invalid
      onClearVehicle(saveVehicle);
      return;
    }

    // Prepare form fields with values from selected vehicle
    const vehicleDetails = {
      vehicleId:
        vehicle.vehicleType === VEHICLE_TYPES.POWER_UNIT
          ? (vehicle as PowerUnit).powerUnitId
          : (vehicle as Trailer).trailerId,
      unitNumber: vehicle.unitNumber,
      vin: vehicle.vin,
      plate: vehicle.plate,
      make: vehicle.make,
      year: vehicle.year,
      countryCode: vehicle.countryCode,
      provinceCode: vehicle.provinceCode,
      vehicleType: getDefaultRequiredVal("", vehicle.vehicleType),
      vehicleSubType: selectedVehicleSubtype(vehicle),
    };

    onSetVehicle({
      ...vehicleDetails,
      saveVehicle,
    });
  };

  const handleChooseFrom = (event: SelectChangeEvent) => {
    setChooseFrom(event.target.value as VehicleChooseFrom);
  };

  const handleSaveVehicleRadioBtns = (saveToInventory: string) => {
    setSaveVehicle(saveToInventory === "true");
  };

  // Reset the vehicle subtype field whenever a different vehicle type is selected
  const handleChangeVehicleType = (event: SelectChangeEvent) => {
    const updatedVehicleType = event.target.value;
    if (updatedVehicleType !== vehicleType) {
      onSetVehicle({
        ...vehicleFormData,
        vehicleType: updatedVehicleType,
        vehicleSubType: "",
        saveVehicle,
      });
    }
  };

  // If the selected vehicle is an LOA vehicle, it should not be edited/saved to inventory
  useEffect(() => {
    if (isSelectedLOAVehicle) {
      setSaveVehicle(false);
    }
  }, [isSelectedLOAVehicle]);

  return (
    <Box className="vehicle-details">
      <Box className="vehicle-details__header">
        <Typography variant={"h3"}>Vehicle Details</Typography>
      </Box>

      <Box className="vehicle-details__body">
        <Typography variant="h3">
          Choose a saved vehicle from your inventory or enter new vehicle
          information below.
        </Typography>

        <div className="vehicle-details__info">
          <InfoBcGovBanner
            msg={BANNER_MESSAGES.CANNOT_FIND_VEHICLE}
            additionalInfo={
              <div className="vehicle-inventory-info">
                Your vehicle may not be available in a permit application
                because it cannot be used for the type of permit you are
                applying for. <br />
                <br />
                If you are creating a new vehicle, a desired Vehicle Sub-Type
                may not be available because it is not eligible for the permit
                application you are currently in.
              </div>
            }
          />

          <div className="vehicle-details__input-section">
            <Box className="vehicle-selection">
              <SelectUnitOrPlate
                value={chooseFrom}
                label={"Choose from"}
                onChange={handleChooseFrom}
                menuItems={CHOOSE_FROM_OPTIONS.map((data) => (
                  <MenuItem key={data.value} value={data.value}>
                    {data.label}
                  </MenuItem>
                ))}
              />

              <SelectVehicleDropdown
                label={"Select vehicle"}
                chooseFrom={chooseFrom}
                selectedVehicle={vehicleFormData}
                vehicleOptions={vehicleOptions}
                handleClearVehicle={() => onClearVehicle(saveVehicle)}
                handleSelectVehicle={onSelectVehicle}
              />
            </Box>

            <CustomFormComponent
              type="input"
              feature={feature}
              options={{
                name: "permitData.vehicleDetails.vin",
                rules: {
                  required: { value: true, message: requiredMessage() },
                  minLength: { value: 6, message: invalidVINLength(6) },
                  maxLength: 6,
                },
                label: "VIN",
                width: formFieldStyle.width,
                customHelperText: "last 6 digits",
              }}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <CustomFormComponent
              type="input"
              feature={feature}
              options={{
                name: "permitData.vehicleDetails.plate",
                rules: {
                  required: { value: true, message: requiredMessage() },
                  maxLength: { value: 10, message: invalidPlateLength(10) },
                },
                label: "Plate",
                width: formFieldStyle.width,
              }}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <CustomFormComponent
              type="input"
              feature={feature}
              options={{
                name: "permitData.vehicleDetails.make",
                rules: {
                  required: { value: true, message: requiredMessage() },
                  maxLength: 20,
                },
                label: "Make",
                width: formFieldStyle.width,
              }}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <CustomFormComponent
              type="input"
              feature={feature}
              onFocus={disableMouseWheelInputOnNumberField}
              options={{
                name: "permitData.vehicleDetails.year",
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
                width: formFieldStyle.width,
              }}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <CountryAndProvince
              feature={feature}
              countryField="permitData.vehicleDetails.countryCode"
              provinceField="permitData.vehicleDetails.provinceCode"
              isProvinceRequired={true}
              width={formFieldStyle.width}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <CustomFormComponent
              type="select"
              feature={feature}
              readOnly={disableVehicleTypeSelect || isSelectedLOAVehicle}
              disabled={disableVehicleTypeSelect || isSelectedLOAVehicle}
              options={{
                name: "permitData.vehicleDetails.vehicleType",
                rules: {
                  required: {
                    value: true,
                    message: requiredMessage(),
                  },
                  onChange: handleChangeVehicleType,
                },
                label: "Vehicle Type",
                width: formFieldStyle.width,
              }}
              menuOptions={VEHICLE_TYPE_OPTIONS.map((data) => (
                <MenuItem
                  key={data.value}
                  value={data.value}
                  data-testid="vehicle-type-menu-item"
                >
                  {data.label}
                </MenuItem>
              ))}
            />

            <CustomFormComponent
              type="select"
              feature={feature}
              options={{
                name: "permitData.vehicleDetails.vehicleSubType",
                rules: {
                  required: { value: true, message: requiredMessage() },
                },
                label: "Vehicle Sub-type",
                width: formFieldStyle.width,
              }}
              menuOptions={subtypeOptions.map((subtype) => (
                <MenuItem
                  key={subtype.typeCode}
                  value={subtype.typeCode}
                  data-testid="subtype-menu-item"
                >
                  {subtype.type}
                </MenuItem>
              ))}
              readOnly={isSelectedLOAVehicle}
              disabled={isSelectedLOAVehicle}
            />

            <FormControl>
              <FormLabel
                id="demo-radio-buttons-group-label"
                sx={{ fontWeight: "bold", marginTop: "24px" }}
              >
                Would you like to add/update this vehicle to your Vehicle
                Inventory?
              </FormLabel>

              <RadioGroup
                aria-labelledby="radio-buttons-group-label"
                defaultValue={saveVehicle}
                value={saveVehicle}
                name="radio-buttons-group"
                onChange={(e) => handleSaveVehicleRadioBtns(e.target.value)}
              >
                <Box sx={{ display: "flex" }}>
                  <FormControlLabel
                    value={true}
                    control={
                      <Radio
                        key={`radio-save-vehicle-yes`}
                        inputProps={
                          {
                            "data-testid": "save-vehicle-yes",
                          } as CustomInputHTMLAttributes
                        }
                        readOnly={isSelectedLOAVehicle}
                        disabled={isSelectedLOAVehicle}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value={false}
                    control={
                      <Radio
                        key={`radio-save-vehicle-no`}
                        inputProps={
                          {
                            "data-testid": "save-vehicle-no",
                          } as CustomInputHTMLAttributes
                        }
                        readOnly={isSelectedLOAVehicle}
                        disabled={isSelectedLOAVehicle}
                      />
                    }
                    label="No"
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </div>
        </div>
      </Box>
    </Box>
  );
};
