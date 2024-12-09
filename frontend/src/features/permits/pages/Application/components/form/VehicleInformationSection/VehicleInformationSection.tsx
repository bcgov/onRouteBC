import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Box, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import "./VehicleInformationSection.scss";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { InfoBcGovBanner } from "../../../../../../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../../../../../../common/constants/bannerMessages";
import { PermitVehicleDetails } from "../../../../../types/PermitVehicleDetails";
import { Vehicle, VehicleSubType } from "../../../../../../manageVehicles/types/Vehicle";
import { VehicleDetails } from "./VehicleDetails";
import { PowerUnitInfo } from "./PowerUnitInfo";
import { AddPowerUnitDialog } from "./AddPowerUnitDialog";
import { AddTrailer } from "./AddTrailer";
import { VehicleInConfiguration } from "../../../../../types/PermitVehicleConfiguration";
import { requiredPowerUnit } from "../../../../../../../common/helpers/validationMessages";
import { ApplicationFormData } from "../../../../../types/application";

export const VehicleInformationSection = ({
  permitType,
  feature,
  vehicleFormData,
  vehicleOptions,
  subtypeOptions,
  isSelectedLOAVehicle,
  nextAllowedSubtypes,
  powerUnitSubtypeNamesMap,
  trailerSubtypeNamesMap,
  selectedConfigSubtypes,
  onSetSaveVehicle,
  onSetVehicle,
  onClearVehicle,
  onUpdateVehicleConfigTrailers,
}: {
  permitType: PermitType;
  feature: string;
  vehicleFormData: PermitVehicleDetails;
  vehicleOptions: Vehicle[];
  subtypeOptions: VehicleSubType[];
  isSelectedLOAVehicle: boolean;
  nextAllowedSubtypes: {
    value: string;
    label: string;
  }[];
  powerUnitSubtypeNamesMap: Map<string, string>;
  trailerSubtypeNamesMap: Map<string, string>;
  selectedConfigSubtypes: string[];
  onSetSaveVehicle: (saveVehicle: boolean) => void;
  onSetVehicle: (vehicleDetails: PermitVehicleDetails) => void;
  onClearVehicle: (saveVehicle: boolean) => void;
  onUpdateVehicleConfigTrailers: (updatedTrailerSubtypes: VehicleInConfiguration[]) => void;
}) => {
  const isSingleTrip = permitType === PERMIT_TYPES.STOS;
  const infoSectionClassName = `vehicle-information-section__info`
    + `${isSingleTrip ? " vehicle-information-section__info--single-trip" : ""}`;

  const infoBannerClassName = `vehicle-information-section__info-banner`
    + `${isSingleTrip ? " vehicle-information-section__info-banner--single-trip" : ""}`;

  const isPowerUnitSelectedForSingleTrip = isSingleTrip && Boolean(vehicleFormData.vin);

  const [showAddPowerUnitDialog, setShowAddPowerUnitDialog] = useState<boolean>(false);

  const powerUnitFieldRef = "permitData.vehicleDetails";
  const { clearErrors } = useFormContext<ApplicationFormData>();

  const handleClickAddPowerUnit = () => {
    if (isPowerUnitSelectedForSingleTrip) return;
    setShowAddPowerUnitDialog(true);
  };

  const handleRemovePowerUnit = () => {
    onClearVehicle(false);
    onUpdateVehicleConfigTrailers([]);
  };

  const handleClosePowerUnitDialog = () => {
    handleRemovePowerUnit();
    setShowAddPowerUnitDialog(false);
  };

  const handleAddPowerUnit = (powerUnit: PermitVehicleDetails) => {
    clearErrors(powerUnitFieldRef);
    onSetVehicle(powerUnit);
    setShowAddPowerUnitDialog(false);
  };

  return (
    <Box className="vehicle-information-section">
      <Box className="vehicle-information-section__header">
        <h3>Vehicle Information</h3>
      </Box>

      <Box className="vehicle-information-section__body">
        <h4>
          Choose a saved vehicle from your inventory or enter new vehicle
          information below.
        </h4>

        <div className={infoSectionClassName}>
          <InfoBcGovBanner
            className={infoBannerClassName}
            msg={BANNER_MESSAGES.CANNOT_FIND_VEHICLE.TITLE}
            additionalInfo={
              <div className="vehicle-inventory-info">
                {BANNER_MESSAGES.CANNOT_FIND_VEHICLE.DETAIL}
                <br />
                <br />
                {BANNER_MESSAGES.CANNOT_FIND_VEHICLE.INELIGIBLE_SUBTYPES}
              </div>
            }
          />

          {isSingleTrip ? (
            <Controller
              name={powerUnitFieldRef}
              rules={{
                validate: (v) => (v.vin.trim() !== "") || requiredPowerUnit(),
              }}
              render={({ fieldState: { error } }) => (
                <div className="add-power-unit">
                  <Button
                    classes={{
                      root: "add-power-unit-btn",
                      disabled: "add-power-unit-btn--disabled",
                    }}
                    key="add-power-unit-button"
                    aria-label="Add Power Unit"
                    variant="contained"
                    color="tertiary"
                    disabled={isPowerUnitSelectedForSingleTrip}
                    onClick={handleClickAddPowerUnit}
                  >
                    <FontAwesomeIcon className="add-power-unit-btn__icon" icon={faPlus} />
                    Add Power Unit
                  </Button>

                  {error?.message ? (
                    <p className="add-power-unit__error">
                      {error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          ) : (
            <VehicleDetails
              feature={feature}
              vehicleFormData={vehicleFormData}
              vehicleOptions={vehicleOptions}
              subtypeOptions={subtypeOptions}
              isSelectedLOAVehicle={isSelectedLOAVehicle}
              permitType={permitType}
              onSetSaveVehicle={onSetSaveVehicle}
              onSetVehicle={onSetVehicle}
              onClearVehicle={onClearVehicle}
            />
          )}
        </div>

        {isPowerUnitSelectedForSingleTrip ? (
          <PowerUnitInfo
            powerUnitInfo={vehicleFormData}
            powerUnitSubtypeNamesMap={powerUnitSubtypeNamesMap}
            onRemovePowerUnit={handleRemovePowerUnit}
          />
        ) : null}

        {isPowerUnitSelectedForSingleTrip ? (
          <AddTrailer
            selectedTrailerSubtypes={selectedConfigSubtypes}
            trailerSubtypeOptions={nextAllowedSubtypes}
            trailerSubtypeNamesMap={trailerSubtypeNamesMap}
            onUpdateVehicleConfigTrailers={onUpdateVehicleConfigTrailers}
          />
        ) : null}
      </Box>

      {showAddPowerUnitDialog ? (
        <AddPowerUnitDialog
          open={showAddPowerUnitDialog}
          feature={feature}
          vehicleFormData={vehicleFormData}
          vehicleOptions={vehicleOptions}
          subtypeOptions={subtypeOptions}
          isSelectedLOAVehicle={isSelectedLOAVehicle}
          permitType={permitType}
          onCancel={handleClosePowerUnitDialog}
          onAddPowerUnit={handleAddPowerUnit}
        />
      ) : null}
    </Box>
  );
};

