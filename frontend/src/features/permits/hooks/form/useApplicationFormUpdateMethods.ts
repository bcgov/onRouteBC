import dayjs, { Dayjs } from "dayjs";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { PermitCondition } from "../../types/PermitCondition";
import { PermitLOA } from "../../types/PermitLOA";
import { PermitVehicleConfiguration, VehicleInConfiguration } from "../../types/PermitVehicleConfiguration";
import { EMPTY_VEHICLE_DETAILS, PermitVehicleDetails } from "../../types/PermitVehicleDetails";
import { ApplicationFormData } from "../../types/application";
import { getDefaultVehicleConfiguration } from "../../helpers/vehicles/configuration/getDefaultVehicleConfiguration";
import { PermitType } from "../../types/PermitType";
import { RequiredOrNull } from "../../../../common/types/common";

/**
 * Hook that returns custom methods that update specific values in the application form.
 * This allows a degree of control over encapsulation of the form methods (eg. without leaking/allowing form methods
 * like setValue to be called directly everywhere throughout the child components).
 * 
 * NOTE: This hook must be used inside a component/hook that is a child of an application FormProvider.
 * @returns Custom methods to update specific values in the application form
 */
export const useApplicationFormUpdateMethods = () => {
  const { setValue } = useFormContext<ApplicationFormData>();

  const onSetDuration = useCallback((duration: number) => {
    setValue("permitData.permitDuration", duration);
  }, [setValue]);

  const onSetExpiryDate = useCallback((expiry: Dayjs) => {
    setValue("permitData.expiryDate", dayjs(expiry));
  }, [setValue]);

  const onSetConditions = useCallback((conditions: PermitCondition[]) => {
    setValue("permitData.commodities", [...conditions]);
  }, [setValue]);

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

  const onSetCommodityType = useCallback((commodityType: string) => {
    setValue("permitData.permittedCommodity.commodityType", commodityType);
  }, [setValue]);

  const onUpdateLOAs = useCallback((updatedLOAs: PermitLOA[]) => {
    setValue("permitData.loas", updatedLOAs);
  }, [setValue]);

  const onUpdateHighwaySequence = useCallback((updatedHighwaySequence: string[]) => {
    setValue(
      "permitData.permittedRoute.manualRoute.highwaySequence",
      updatedHighwaySequence,
    );
  }, [setValue]);

  const onUpdateVehicleConfigTrailers = useCallback(
    (updatedTrailerSubtypes: VehicleInConfiguration[]) => {
      setValue(
        "permitData.vehicleConfiguration.trailers",
        updatedTrailerSubtypes,
      );
    },
    [setValue],
  );

  const onUpdateVehicleConfig = useCallback(
    (updatedVehicleConfig: RequiredOrNull<PermitVehicleConfiguration>) => {
      setValue(
        "permitData.vehicleConfiguration",
        updatedVehicleConfig,
      );
    },
    [setValue],
  );

  const onClearVehicleConfig = useCallback(
    (permitType: PermitType) => {
      setValue(
        "permitData.vehicleConfiguration",
        getDefaultVehicleConfiguration(permitType),
      );
    },
    [setValue],
  );

  return {
    onSetDuration,
    onSetExpiryDate,
    onSetConditions,
    onToggleSaveVehicle,
    onSetVehicle,
    onClearVehicle,
    onUpdateLOAs,
    onUpdateHighwaySequence,
    onUpdateVehicleConfigTrailers,
    onSetCommodityType,
    onUpdateVehicleConfig,
    onClearVehicleConfig,
  };
};
