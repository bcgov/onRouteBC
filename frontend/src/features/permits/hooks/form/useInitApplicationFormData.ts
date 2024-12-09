import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Policy } from "onroute-policy-engine";

import { Application, ApplicationFormData } from "../../types/application";
import { BCeIDUserDetailContext } from "../../../../common/authentication/OnRouteBCContext";
import { CompanyProfile } from "../../../manageProfile/types/manageProfile";
import { Nullable } from "../../../../common/types/common";
import { PermitType } from "../../types/PermitType";
import { LOADetail } from "../../../settings/types/LOADetail";
import { applyUpToDateLOAsToApplication } from "../../helpers/permitLOA";
import { getDefaultValues } from "../../helpers/getDefaultApplicationFormData";
import { applyLCVToApplicationData } from "../../helpers/permitLCV";
import { PowerUnit, Trailer } from "../../../manageVehicles/types/Vehicle";
import { getEligibleVehicleSubtypes } from "../../helpers/vehicles/subtypes/getEligibleVehicleSubtypes";

/**
 * Custom hook for populating the form using fetched application data, as well as current company id and user details.
 * This also involves resetting certain form values whenever new/updated application data is fetched.
 * @param permitType Permit type for the application
 * @param isLcvDesignated Whether or not the company is designated to use LCV for permits
 * @param companyLOAs Most up-to-date LOAs belonging to the company
 * @param inventoryVehicles Vehicles in the inventory for the company
 * @param companyInfo Company information for filling out the form
 * @param applicationData Application data received to fill out the form, preferrably from ApplicationContext/backend
 * @param userDetails User details for filling out the form
 * @param policyEngine Instance of the policy engine, if it's available
 * @returns Current application form data, methods to manage the form, and selectable input options
 */
export const useInitApplicationFormData = (
  data: {
    permitType: PermitType;
    isLcvDesignated: boolean;
    companyLOAs: LOADetail[];
    inventoryVehicles: (PowerUnit | Trailer)[];
    companyInfo: Nullable<CompanyProfile>;
    applicationData?: Nullable<Application>;
    userDetails?: BCeIDUserDetailContext;
    policyEngine?: Nullable<Policy>;
  },
) => {
  const {
    permitType,
    isLcvDesignated,
    companyLOAs,
    inventoryVehicles,
    companyInfo,
    applicationData,
    userDetails,
    policyEngine,
  } = data;

  // Used to populate/initialize the form with
  // This will be updated whenever new application, company, and user data is fetched
  const initialFormData = useMemo(() => {
    const eligibleVehicleSubtypes = getEligibleVehicleSubtypes(
      permitType,
      isLcvDesignated,
      applicationData?.permitData?.permittedCommodity?.commodityType,
      policyEngine,
    );

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
      companyLOAs,
      inventoryVehicles,
      eligibleVehicleSubtypes,
    );
  }, [
    permitType,
    companyInfo,
    applicationData,
    userDetails,
    isLcvDesignated,
    companyLOAs,
    inventoryVehicles,
    policyEngine,
  ]);

  // Register default values with react-hook-form
  const formMethods = useForm<ApplicationFormData>({
    defaultValues: initialFormData,
    reValidateMode: "onChange",
  });

  const { watch, reset } = formMethods;
  const currentFormData = watch();

  // Reset the form with updated default form data whenever fetched data changes
  useEffect(() => {
    reset(initialFormData);
  }, [initialFormData]);

  return {
    initialFormData,
    currentFormData,
    formMethods,
  };
};
