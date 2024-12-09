import { Nullable } from "../../../common/types/common";
import { isVehicleSubtypeLCV } from "../../manageVehicles/helpers/vehicleSubtypes";
import { Application, ApplicationFormData } from "../types/application";
import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { getPermitConditionSelectionState } from "./conditions";
import { getDefaultVehicleDetails } from "./vehicles/getDefaultVehicleDetails";

/**
 * Get updated vehicle details based on LCV designation.
 * @param isLcvDesignated Whether or not the LCV designation is to be used
 * @param prevSelectedVehicle Previous selected vehicle details
 * @returns Updated vehicle details
 */
export const getUpdatedVehicleDetailsForLCV = (
  isLcvDesignated: boolean,
  prevSelectedVehicle: PermitVehicleDetails,
) => {
  if (!isLcvDesignated && isVehicleSubtypeLCV(prevSelectedVehicle.vehicleSubType)) {
    // If LCV isn't designated, and selected vehicle has LCV subtype, clear the vehicle
    return getDefaultVehicleDetails();
  }

  // Otherwise keep the existing vehicle details
  return prevSelectedVehicle;
};

/**
 * Applying LCV designation to application data.
 * @param applicationData Existing application data
 * @param isLcvDesignated Whether or not the LCV designation is to be used
 * @returns Application data after applying the LCV check
 */
export const applyLCVToApplicationData = <T extends Nullable<ApplicationFormData | Application>>(
  applicationData: T,
  isLcvDesignated: boolean,
): T => {
  // If application doesn't exist, no need to apply LCV at all
  if (!applicationData) return applicationData;

  const updatedVehicleDetails = getUpdatedVehicleDetailsForLCV(
    isLcvDesignated,
    applicationData.permitData.vehicleDetails,
  );

  const updatedConditions = getPermitConditionSelectionState(
    applicationData.permitType,
    isLcvDesignated,
    updatedVehicleDetails.vehicleSubType,
    applicationData.permitData.commodities,
  ).filter(({ checked }) => checked);

  return {
    ...applicationData,
    permitData: {
      ...applicationData.permitData,
      commodities: [...updatedConditions],
      vehicleDetails: updatedVehicleDetails,
    },
  };
};
