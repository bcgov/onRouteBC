import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

import { Nullable } from "../../../../../common/types/common";
import { Permit } from "../../../types/permit";
import { Application } from "../../../types/application";
import { applyWhenNotNullable } from "../../../../../common/helpers/util";
import { CompanyProfile } from "../../../../manageProfile/types/manageProfile";
import { applyLCVToApplicationData } from "../../../helpers/permitLCV";
import { PermitCondition } from "../../../types/PermitCondition";
import { EMPTY_VEHICLE_DETAILS, PermitVehicleDetails } from "../../../types/PermitVehicleDetails";
import { LOADetail } from "../../../../settings/types/LOADetail";
import { getIneligibleSubtypes } from "../../../helpers/permitVehicles";
import { applyUpToDateLOAsToApplication } from "../../../helpers/permitLOA";
import { PowerUnit, Trailer } from "../../../../manageVehicles/types/Vehicle";
import { PermitLOA } from "../../../types/PermitLOA";
import {
  AmendPermitFormData,
  getDefaultFormDataFromApplication,
  getDefaultFormDataFromPermit,
} from "../types/AmendPermitFormData";

export const useAmendPermitForm = (
  repopulateFormData: boolean,
  isLcvDesignated: boolean,
  companyLOAs: LOADetail[],
  inventoryVehicles: (PowerUnit | Trailer)[],
  companyInfo: Nullable<CompanyProfile>,
  permit?: Nullable<Permit>,
  amendmentApplication?: Nullable<Application>,
) => {
  // Default form data values to populate the amend form with
  const defaultFormData = useMemo(() => {
    if (amendmentApplication) {
      const ineligibleSubtypes = getIneligibleSubtypes(
        amendmentApplication.permitType,
        isLcvDesignated,
      );

      const ineligiblePowerUnitSubtypes= ineligibleSubtypes.ineligiblePowerUnitSubtypes
        .map(({ typeCode }) => typeCode);
      
      const ineligibleTrailerSubtypes = ineligibleSubtypes.ineligibleTrailerSubtypes
        .map(({ typeCode }) => typeCode);

      return applyUpToDateLOAsToApplication(
        applyLCVToApplicationData(
          getDefaultFormDataFromApplication(
            companyInfo,
            amendmentApplication,
          ),
          isLcvDesignated,
        ),
        companyLOAs,
        inventoryVehicles,
        ineligiblePowerUnitSubtypes,
        ineligibleTrailerSubtypes,
      );
    }

    // Permit doesn't have existing amendment application
    // Populate form data with permit, with initial empty comment
    const defaultPermitFormData = getDefaultFormDataFromPermit(
      companyInfo,
      applyWhenNotNullable(
        (p) => ({
          ...p,
          comment: "",
        }),
        permit,
      ),
    );

    const ineligibleSubtypes = getIneligibleSubtypes(
      defaultPermitFormData.permitType,
      isLcvDesignated,
    );

    const ineligiblePowerUnitSubtypes= ineligibleSubtypes.ineligiblePowerUnitSubtypes
      .map(({ typeCode }) => typeCode);
    
    const ineligibleTrailerSubtypes = ineligibleSubtypes.ineligibleTrailerSubtypes
      .map(({ typeCode }) => typeCode);
    
    return applyUpToDateLOAsToApplication(
      applyLCVToApplicationData(
        defaultPermitFormData,
        isLcvDesignated,
      ),
      companyLOAs,
      inventoryVehicles,
      ineligiblePowerUnitSubtypes,
      ineligibleTrailerSubtypes,
    );
  }, [
    amendmentApplication,
    permit,
    repopulateFormData,
    companyInfo,
    isLcvDesignated,
    companyLOAs,
    inventoryVehicles,
  ]);

  // Register default values with react-hook-form
  const formMethods = useForm<AmendPermitFormData>({
    defaultValues: defaultFormData,
    reValidateMode: "onBlur",
  });

  const { reset, watch, setValue } = formMethods;
  const formData = watch();

  useEffect(() => {
    reset(defaultFormData);
  }, [defaultFormData]);

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

  const onUpdateLOAs = useCallback((updatedLOAs: PermitLOA[]) => {
    setValue("permitData.loas", updatedLOAs);
  }, [setValue]);

  return {
    initialFormData: defaultFormData,
    formData,
    formMethods,
    onSetDuration,
    onSetExpiryDate,
    onSetConditions,
    onToggleSaveVehicle,
    onSetVehicle,
    onClearVehicle,
    onUpdateLOAs,
  };
};
