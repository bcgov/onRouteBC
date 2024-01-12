import { Box } from "@mui/material";
import { Dayjs } from "dayjs";
import { Dispatch, SetStateAction } from "react";

import "./PermitReview.scss";
import { WarningBcGovBanner } from "../../../../../../common/components/banners/WarningBcGovBanner";
import { ApplicationDetails } from "../../../../components/form/ApplicationDetails";
import { ReviewContactDetails } from "./ReviewContactDetails";
import { ReviewPermitDetails } from "./ReviewPermitDetails";
import { ReviewVehicleInfo } from "./ReviewVehicleInfo";
import { ReviewFeeSummary } from "./ReviewFeeSummary";
import { ReviewActions } from "./ReviewActions";
import { CompanyProfile } from "../../../../../manageProfile/types/manageProfile";
import { VehicleSubType } from "../../../../../manageVehicles/types/Vehicle";
import { PermitType } from "../../../../types/PermitType";
import { calculateFeeByDuration } from "../../../../helpers/feeSummary";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { Nullable } from "../../../../../../common/types/common";
import {
  Application,
  Commodities,
  ContactDetails,
  VehicleDetails,
} from "../../../../types/application";

interface PermitReviewProps {
  permitType?: PermitType;
  permitNumber?: string;
  applicationNumber?: string;
  createdDateTime?: Dayjs;
  updatedDateTime?: Dayjs;
  companyInfo?: Nullable<CompanyProfile>;
  contactDetails?: ContactDetails;
  permitStartDate?: Dayjs;
  permitDuration?: number;
  permitExpiryDate?: Dayjs;
  permitConditions?: Commodities[];
  continueBtnText: string;
  isAmendAction: boolean;
  children?: React.ReactNode;
  hasAttemptedCheckboxes: boolean;
  allChecked: boolean;
  setAllChecked: Dispatch<SetStateAction<boolean>>;
  powerUnitSubTypes?: VehicleSubType[];
  trailerSubTypes?: VehicleSubType[];
  vehicleDetails?: VehicleDetails;
  vehicleWasSaved?: boolean;
  onEdit: () => void;
  onContinue: () => Promise<void>;
  showChangedFields?: boolean;
  oldFields?: Nullable<Partial<Application>>;
  calculatedFee?: string;
}

export const PermitReview = (props: PermitReviewProps) => {
  const feeSummary = props.calculatedFee
    ? props.calculatedFee
    : `${calculateFeeByDuration(
        getDefaultRequiredVal(0, props.permitDuration),
      )}`;

  return (
    <Box className="permit-review layout-box">
      <Box className="permit-review__container">
        <WarningBcGovBanner msg="Please review and confirm that the information below is correct." />

        <ApplicationDetails
          permitType={props.permitType}
          infoNumberType={props.isAmendAction ? "permit" : "application"}
          infoNumber={
            props.isAmendAction ? props.permitNumber : props.applicationNumber
          }
          createdDateTime={props.createdDateTime}
          updatedDateTime={props.updatedDateTime}
          companyInfo={props.companyInfo}
        />

        <ReviewContactDetails
          contactDetails={props.contactDetails}
          showChangedFields={props.showChangedFields}
          oldFields={props.oldFields?.permitData?.contactDetails}
        />

        <ReviewPermitDetails
          startDate={props.permitStartDate}
          permitDuration={props.permitDuration}
          expiryDate={props.permitExpiryDate}
          conditions={props.permitConditions}
          showChangedFields={props.showChangedFields}
          oldStartDate={props.oldFields?.permitData?.startDate}
          oldDuration={props.oldFields?.permitData?.permitDuration}
        />

        <ReviewVehicleInfo
          powerUnitSubTypes={props.powerUnitSubTypes}
          trailerSubTypes={props.trailerSubTypes}
          vehicleDetails={props.vehicleDetails}
          vehicleWasSaved={props.vehicleWasSaved}
          showChangedFields={props.showChangedFields}
          oldFields={props.oldFields?.permitData?.vehicleDetails}
        />

        <ReviewFeeSummary
          isSubmitted={props.hasAttemptedCheckboxes}
          isChecked={props.allChecked}
          setIsChecked={props.setAllChecked}
          permitType={props.permitType}
          fee={feeSummary}
        />

        {props.children}

        <ReviewActions
          onEdit={props.onEdit}
          onContinue={props.onContinue}
          continueBtnText={props.continueBtnText}
        />
      </Box>
    </Box>
  );
};
