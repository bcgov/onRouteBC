import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import "./AddPowerUnitDialog.scss";
import { VehicleDetails } from "./VehicleDetails";
import { EMPTY_VEHICLE_DETAILS, PermitVehicleDetails } from "../../../../../types/PermitVehicleDetails";
import { Vehicle, VehicleSubType } from "../../../../../../manageVehicles/types/Vehicle";
import { PermitType } from "../../../../../types/PermitType";
import { serializePermitVehicleDetails } from "../../../../../helpers/serialize/serializePermitVehicleDetails";

export const AddPowerUnitDialog = ({
  open,
  feature,
  vehicleFormData,
  vehicleOptions,
  subtypeOptions,
  isSelectedLOAVehicle,
  permitType,
  onCancel,
  onAddPowerUnit,
}: {
  open: boolean;
  feature: string;
  vehicleFormData: PermitVehicleDetails;
  vehicleOptions: Vehicle[];
  subtypeOptions: VehicleSubType[];
  isSelectedLOAVehicle: boolean;
  permitType: PermitType;
  onCancel: () => void;
  onAddPowerUnit: (powerUnit: PermitVehicleDetails) => void;
}) => {
  const formMethods = useForm<{
    permitData: {
      vehicleDetails: PermitVehicleDetails;
    };
  }>({
    defaultValues: {
      permitData: {
        vehicleDetails: vehicleFormData,
      },
    },
    reValidateMode: "onChange",
  });

  const { handleSubmit, setValue, watch } = formMethods;
  const selectedVehicle = watch("permitData.vehicleDetails");

  const onToggleSaveVehicle = useCallback((saveVehicle: boolean) => {
    setValue("permitData.vehicleDetails.saveVehicle", saveVehicle);
  }, [setValue]);

  const onSetVehicle = useCallback((vehicleDetails: PermitVehicleDetails) => {
    setValue("permitData.vehicleDetails", {
      ...vehicleDetails,
    });
  }, [setValue]);

  const onClearVehicle = useCallback((saveVehicle: boolean) => {
    setValue("permitData.vehicleDetails", {
      ...EMPTY_VEHICLE_DETAILS,
      saveVehicle,
    });
  }, [setValue]);

  const handleAdd = () => {
    const powerUnit = serializePermitVehicleDetails(selectedVehicle);
    onAddPowerUnit(powerUnit);
  };

  return (
    <Dialog
      className="add-power-unit-dialog"
      open={open}
      onClose={onCancel}
      classes={{
        paper: "add-power-unit-dialog__container",
      }}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(handleAdd)}>
          <DialogTitle
            component="div"
            className="add-power-unit-dialog__header"
          >
            <div className="add-power-unit-dialog__icon">
              <FontAwesomeIcon className="icon" icon={faPlus} />
            </div>

            <span className="add-power-unit-dialog__title">
              Add Power Unit
            </span>
          </DialogTitle>

          <DialogContent className="add-power-unit-dialog__body">
            <VehicleDetails
              feature={feature}
              vehicleFormData={selectedVehicle}
              vehicleOptions={vehicleOptions}
              subtypeOptions={subtypeOptions}
              isSelectedLOAVehicle={isSelectedLOAVehicle}
              permitType={permitType}
              onSetSaveVehicle={onToggleSaveVehicle}
              onSetVehicle={onSetVehicle}
              onClearVehicle={onClearVehicle}
            />
          </DialogContent>

          <DialogActions className="add-power-unit-dialog__btns">
            <Button
              key="cancel-button"
              aria-label="Cancel"
              variant="contained"
              color="tertiary"
              className="add-power-unit-dialog__btn add-power-unit-dialog__btn--cancel"
              onClick={onCancel}
              data-testid="cancel-button"
            >
              Cancel
            </Button>

            <Button
              key="add-power-unit-button"
              aria-label="Add"
              type="submit"
              className="add-power-unit-dialog__btn add-power-unit-dialog__btn--add"
              data-testid="add-power-unit-button"
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
