import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Policy } from "onroute-policy-engine";

import { Nullable } from "../../../../../common/types/common";
import { Permit } from "../../../types/permit";
import { Application } from "../../../types/application";
import { applyWhenNotNullable } from "../../../../../common/helpers/util";
import { CompanyProfile } from "../../../../manageProfile/types/manageProfile";
import { applyLCVToApplicationData } from "../../../helpers/permitLCV";
import { LOADetail } from "../../../../settings/types/LOADetail";
import { getEligibleVehicleSubtypes } from "../../../helpers/vehicles/subtypes/getEligibleVehicleSubtypes";
import { applyUpToDateLOAsToApplication } from "../../../helpers/permitLOA";
import { PowerUnit, Trailer } from "../../../../manageVehicles/types/Vehicle";
import {
  AmendPermitFormData,
  getDefaultFormDataFromApplication,
  getDefaultFormDataFromPermit,
} from "../types/AmendPermitFormData";

export const useAmendPermitForm = (
  data: {
    repopulateFormData: boolean;
    isLcvDesignated: boolean;
    companyLOAs: LOADetail[];
    inventoryVehicles: (PowerUnit | Trailer)[];
    companyInfo: Nullable<CompanyProfile>;
    permit?: Nullable<Permit>;
    amendmentApplication?: Nullable<Application>;
    policyEngine?: Nullable<Policy>;
  },
) => {
  const {
    repopulateFormData,
    isLcvDesignated,
    companyLOAs,
    inventoryVehicles,
    companyInfo,
    permit,
    amendmentApplication,
    policyEngine,
  } = data;

  // Default form data values to populate the amend form with
  const defaultFormData = useMemo(() => {
    if (amendmentApplication) {
      const eligibleSubtypes = getEligibleVehicleSubtypes(
        amendmentApplication.permitType,
        isLcvDesignated,
        amendmentApplication.permitData.permittedCommodity?.commodityType,
        policyEngine,
      );

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
        eligibleSubtypes,
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

    const eligibleSubtypes = getEligibleVehicleSubtypes(
      defaultPermitFormData.permitType,
      isLcvDesignated,
      defaultPermitFormData.permitData.permittedCommodity?.commodityType,
      policyEngine,
    );
    
    return applyUpToDateLOAsToApplication(
      applyLCVToApplicationData(
        defaultPermitFormData,
        isLcvDesignated,
      ),
      companyLOAs,
      inventoryVehicles,
      eligibleSubtypes,
    );
  }, [
    amendmentApplication,
    permit,
    repopulateFormData,
    companyInfo,
    isLcvDesignated,
    companyLOAs,
    inventoryVehicles,
    policyEngine,
  ]);

  // Register default values with react-hook-form
  const formMethods = useForm<AmendPermitFormData>({
    defaultValues: defaultFormData,
    reValidateMode: "onChange",
  });

  const { reset, watch } = formMethods;
  const formData = watch();

  useEffect(() => {
    reset(defaultFormData);
  }, [defaultFormData]);

  return {
    initialFormData: defaultFormData,
    formData,
    formMethods,
  };
};
