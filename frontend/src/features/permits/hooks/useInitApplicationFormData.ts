import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

import { Application, ApplicationFormData } from "../types/application";
import { BCeIDUserDetailContext } from "../../../common/authentication/OnRouteBCContext";
import { CompanyProfile } from "../../manageProfile/types/manageProfile";
import { Nullable } from "../../../common/types/common";
import { PermitType } from "../types/PermitType";
import { LOADetail } from "../../settings/types/SpecialAuthorization";
import { applyUpToDateLOAsToApplication } from "../helpers/permitLOA";
import { getDefaultValues } from "../helpers/getDefaultApplicationFormData";
import { applyLCVToApplicationData } from "../helpers/permitLCV";
import { PowerUnit, Trailer } from "../../manageVehicles/types/Vehicle";
import { getIneligibleSubtypes } from "../helpers/permitVehicles";
import { PermitCondition } from "../types/PermitCondition";
import { EMPTY_VEHICLE_DETAILS, PermitVehicleDetails } from "../types/PermitVehicleDetails";

/**
 * Custom hook for populating the form using fetched application data, as well as current company id and user details.
 * This also involves resetting certain form values whenever new/updated application data is fetched.
 * @param permitType Permit type for the application
 * @param isLcvDesignated Whether or not the company is designated to use LCV for permits
 * @param loas Most up-to-date LOAs belonging to the company
 * @param companyInfo Company information for filling out the form
 * @param applicationData Application data received to fill out the form, preferrably from ApplicationContext/backend
 * @param userDetails User details for filling out the form
 * @returns Current application form data, methods to manage the form, and selectable input options
 */
export const useInitApplicationFormData = (
  permitType: PermitType,
  isLcvDesignated: boolean,
  loas: LOADetail[],
  inventoryVehicles: (PowerUnit | Trailer)[],
  companyInfo: Nullable<CompanyProfile>,
  applicationData?: Nullable<Application>,
  userDetails?: BCeIDUserDetailContext,
) => {
  // Used to populate/initialize the form with
  // This will be updated whenever new application, company, and user data is fetched
  const initialFormData = useMemo(() => {
    const ineligibleSubtypes = getIneligibleSubtypes(permitType, isLcvDesignated);
    const ineligiblePowerUnitSubtypes= ineligibleSubtypes.ineligiblePowerUnitSubtypes
      .map(({ typeCode }) => typeCode);
    
    const ineligibleTrailerSubtypes = ineligibleSubtypes.ineligibleTrailerSubtypes
      .map(({ typeCode }) => typeCode);
    
    return applyUpToDateLOAsToApplication(
      applyLCVToApplicationData(
        getDefaultValues(
          permitType,
          companyInfo,
          applicationData,
          userDetails,
        ),
        isLcvDesignated,
      ),
      loas,
      inventoryVehicles,
      ineligiblePowerUnitSubtypes,
      ineligibleTrailerSubtypes,
    );
  }, [
    permitType,
    companyInfo,
    applicationData,
    userDetails,
    isLcvDesignated,
    loas,
    inventoryVehicles,
  ]);

  // Register default values with react-hook-form
  const formMethods = useForm<ApplicationFormData>({
    defaultValues: initialFormData,
    reValidateMode: "onBlur",
  });

  const { watch, reset, setValue } = formMethods;
  const currentFormData = watch();

  // Reset the form with updated default form data whenever fetched data changes
  useEffect(() => {
    reset(initialFormData);
  }, [initialFormData]);

  const onSetDuration = (duration: number) => {
    setValue("permitData.permitDuration", duration);
  };

  const onSetExpiryDate = (expiry: Dayjs) => {
    setValue("permitData.expiryDate", dayjs(expiry));
  };

  const onSetConditions = (conditions: PermitCondition[]) => {
    setValue("permitData.commodities", [...conditions]);
  };

  const onToggleSaveVehicle = (saveVehicle: boolean) => {
    setValue("permitData.vehicleDetails.saveVehicle", saveVehicle);
  };

  const onSetVehicle = (vehicleDetails: PermitVehicleDetails) => {
    setValue("permitData.vehicleDetails", {
      ...vehicleDetails,
    });
  };

  const onClearVehicle = (saveVehicle: boolean) => {
    setValue("permitData.vehicleDetails", {
      ...EMPTY_VEHICLE_DETAILS,
      saveVehicle,
    });
  };

  const onUpdateLOAs = (updatedLOAs: LOADetail[]) => {
    setValue("permitData.loas", updatedLOAs);
  };

  return {
    initialFormData,
    currentFormData,
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
