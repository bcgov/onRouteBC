import { Box } from "@mui/material";
import { Dayjs } from "dayjs";
import { useMemo } from "react";

import "./PermitReview.scss";
import { ReviewActions } from "./ReviewActions";
import { ReviewContactDetails } from "./ReviewContactDetails";
import { ReviewFeeSummary } from "./ReviewFeeSummary";
import { ReviewPermitDetails } from "./ReviewPermitDetails";
import { ReviewPermitLOAs } from "./ReviewPermitLOAs";
import { ReviewVehicleInfo } from "./ReviewVehicleInfo";
import { PERMIT_TYPES, PermitType } from "../../../../types/PermitType";
import { PermitVehicleDetails } from "../../../../types/PermitVehicleDetails";
import { WarningBcGovBanner } from "../../../../../../common/components/banners/WarningBcGovBanner";
import { Nullable } from "../../../../../../common/types/common";
import { CompanyProfile } from "../../../../../manageProfile/types/manageProfile";
import { VehicleSubType } from "../../../../../manageVehicles/types/Vehicle";
import { ApplicationDetails } from "../../../../components/form/ApplicationDetails";
import { Application } from "../../../../types/application";
import { PermitCondition } from "../../../../types/PermitCondition";
import { PermitContactDetails } from "../../../../types/PermitContactDetails";
import { PermitLOA } from "../../../../types/PermitLOA";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { ApplicationRejectionHistory } from "../../../../types/ApplicationRejectionHistory";
import { ReviewApplicationRejectionHistory } from "./ReviewApplicationRejectionHistory";
import { isPermitStartOrExpiryDateInPast } from "../../../../helpers/dateSelection";
import { CommodityDetails } from "./CommodityDetails";
import { PermittedCommodity } from "../../../../types/PermittedCommodity";
import { PermitVehicleConfiguration } from "../../../../types/PermitVehicleConfiguration";
import { PermittedRoute } from "../../../../types/PermittedRoute";
import { LoadedDimensions } from "./LoadedDimensions";
import { ApplicationNotes } from "./ApplicationNotes";
import { TripDetails } from "./TripDetails";
import {
  PERMIT_REVIEW_CONTEXTS,
  PermitReviewContext,
} from "../../../../types/PermitReviewContext";

interface PermitReviewProps {
  reviewContext: PermitReviewContext;
  permitType?: Nullable<PermitType>;
  permitNumber?: Nullable<string>;
  applicationNumber?: Nullable<string>;
  createdDateTime?: Nullable<Dayjs>;
  updatedDateTime?: Nullable<Dayjs>;
  companyInfo?: Nullable<CompanyProfile>;
  contactDetails?: Nullable<PermitContactDetails>;
  permitStartDate?: Nullable<Dayjs>;
  permitDuration?: Nullable<number>;
  permitExpiryDate?: Nullable<Dayjs>;
  permitConditions?: Nullable<PermitCondition[]>;
  permittedCommodity?: Nullable<PermittedCommodity>;
  commodityOptions: {
    label: string;
    value: string;
  }[];
  continueBtnText?: string;
  isAmendAction: boolean;
  children?: React.ReactNode;
  hasAttemptedCheckboxes: boolean;
  allConfirmed: boolean;
  setAllConfirmed: (confirmed: boolean) => void;
  powerUnitSubTypes?: Nullable<VehicleSubType[]>;
  trailerSubTypes?: Nullable<VehicleSubType[]>;
  vehicleDetails?: Nullable<PermitVehicleDetails>;
  vehicleWasSaved?: Nullable<boolean>;
  vehicleConfiguration?: Nullable<PermitVehicleConfiguration>;
  route?: Nullable<PermittedRoute>;
  applicationNotes?: Nullable<string>;
  onEdit: () => void;
  onContinue?: () => Promise<void>;
  onAddToCart?: () => Promise<void>;
  handleApproveButton?: () => Promise<void>;
  updateApplicationMutationPending?: boolean;
  handleRejectButton?: () => void;
  showChangedFields?: boolean;
  oldFields?: Nullable<Partial<Application>>;
  calculatedFee: string;
  doingBusinessAs?: Nullable<string>;
  loas?: Nullable<PermitLOA[]>;
  applicationRejectionHistory?: Nullable<ApplicationRejectionHistory[]>;
  isStaffUser: boolean;
}

export const PermitReview = (props: PermitReviewProps) => {
  const { powerUnitSubTypes, trailerSubTypes } = props;
  const powerUnitSubtypeNamesMap = useMemo(() => new Map<string, string>(
    getDefaultRequiredVal([], powerUnitSubTypes)
      .map(({ typeCode, type }) => [typeCode, type]),
  ), [powerUnitSubTypes]);

  const trailerSubtypeNamesMap = useMemo(() => new Map<string, string>(
    getDefaultRequiredVal([], trailerSubTypes)
      .map(({ typeCode, type }) => [typeCode, type]),
  ), [trailerSubTypes]);

  const shouldShowRejectionHistory =
    (props.reviewContext === PERMIT_REVIEW_CONTEXTS.QUEUE ||
      props.reviewContext === PERMIT_REVIEW_CONTEXTS.APPLY) &&
    props.applicationRejectionHistory &&
    props.applicationRejectionHistory.length > 0;

  const invalidPermitDates =
    props.permitStartDate && props.permitExpiryDate
      ? isPermitStartOrExpiryDateInPast(
          props.permitStartDate,
          props.permitExpiryDate,
        )
      : false;

  const hasToCartButton = props.reviewContext === PERMIT_REVIEW_CONTEXTS.APPLY
    && (props.permitType !== PERMIT_TYPES.STOS || props.isStaffUser);

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
          isAmendAction={props.isAmendAction}
          createdDateTime={props.createdDateTime}
          updatedDateTime={props.updatedDateTime}
          companyInfo={props.companyInfo}
          doingBusinessAs={props.doingBusinessAs}
        />

        <ReviewContactDetails
          contactDetails={props.contactDetails}
          showChangedFields={props.showChangedFields}
          oldFields={props.oldFields?.permitData?.contactDetails}
        />

        <ReviewPermitLOAs loas={props.loas} />

        <ReviewPermitDetails
          startDate={props.permitStartDate}
          permitDuration={props.permitDuration}
          expiryDate={props.permitExpiryDate}
          conditions={props.permitConditions}
          showChangedFields={props.showChangedFields}
          oldStartDate={props.oldFields?.permitData?.startDate}
          oldDuration={props.oldFields?.permitData?.permitDuration}
          showDateErrorBanner={invalidPermitDates}
        />

        <CommodityDetails
          commodity={props.permittedCommodity}
          oldCommodity={props.oldFields?.permitData?.permittedCommodity}
          showChangedFields={props.showChangedFields}
          commodityOptions={props.commodityOptions}
        />

        <ReviewVehicleInfo
          permitType={props.permitType}
          powerUnitSubtypeNamesMap={powerUnitSubtypeNamesMap}
          trailerSubtypeNamesMap={trailerSubtypeNamesMap}
          vehicleDetails={props.vehicleDetails}
          vehicleWasSaved={props.vehicleWasSaved}
          showChangedFields={props.showChangedFields}
          oldFields={props.oldFields?.permitData?.vehicleDetails}
          selectedVehicleConfigSubtypes={props.vehicleConfiguration?.trailers}
        />

        <LoadedDimensions
          vehicleConfiguration={props.vehicleConfiguration}
          oldVehicleConfiguration={props.oldFields?.permitData?.vehicleConfiguration}
          showChangedFields={props.showChangedFields}
        />

        <TripDetails
          routeDetails={props.route}
          oldRouteDetails={props.oldFields?.permitData?.permittedRoute}
          showChangedFields={props.showChangedFields}
        />

        <ApplicationNotes applicationNotes={props.applicationNotes} />

        {shouldShowRejectionHistory && props.applicationRejectionHistory ? (
          <ReviewApplicationRejectionHistory
            applicationRejectionHistory={props.applicationRejectionHistory}
          />
        ) : null}

        <ReviewFeeSummary
          hasAttemptedSubmission={props.hasAttemptedCheckboxes}
          areAllConfirmed={props.allConfirmed}
          setAreAllConfirmed={props.setAllConfirmed}
          permitType={props.permitType}
          fee={props.calculatedFee}
          reviewContext={props.reviewContext}
        />

        {props.children}

        <ReviewActions
          reviewContext={props.reviewContext}
          onEdit={props.onEdit}
          continueBtnText={props.continueBtnText}
          onContinue={props.onContinue}
          hasToCartButton={hasToCartButton}
          onAddToCart={props.onAddToCart}
          handleApproveButton={props.handleApproveButton}
          handleRejectButton={props.handleRejectButton}
          disableApproveButton={
            props.updateApplicationMutationPending || invalidPermitDates
          }
          disableRejectButton={props.updateApplicationMutationPending}
        />
      </Box>
    </Box>
  );
};
