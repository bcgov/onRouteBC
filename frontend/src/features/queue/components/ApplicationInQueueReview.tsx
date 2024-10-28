import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable } from "../../../common/types/common";
import { APPLICATION_STEPS, IDIR_ROUTES } from "../../../routes/constants";
import { useCompanyInfoDetailsQuery } from "../../manageProfile/apiManager/hooks";
import { usePowerUnitSubTypesQuery } from "../../manageVehicles/hooks/powerUnits";
import { useTrailerSubTypesQuery } from "../../manageVehicles/hooks/trailers";
import { calculateFeeByDuration } from "../../permits/helpers/feeSummary";
import { PermitReview } from "../../permits/pages/Application/components/review/PermitReview";
import { Application } from "../../permits/types/application";
import { PERMIT_REVIEW_CONTEXTS } from "../../permits/types/PermitReviewContext";
import { DEFAULT_PERMIT_TYPE } from "../../permits/types/PermitType";
import { useFetchSpecialAuthorizations } from "../../settings/hooks/specialAuthorizations";
import { useUpdateApplicationInQueueStatus } from "../hooks/hooks";
import { CASE_ACTIVITY_TYPES } from "../types/CaseActivityType";
import "./ApplicationInQueueReview.scss";
import { QueueBreadcrumb } from "./QueueBreadcrumb";
import { RejectApplicationModal } from "./RejectApplicationModal";

export const ApplicationInQueueReview = ({
  applicationData,
}: {
  applicationData?: Nullable<Application>;
}) => {
  const companyId = getDefaultRequiredVal(0, applicationData?.companyId);
  const applicationId = getDefaultRequiredVal("", applicationData?.permitId);

  const { data: specialAuth } = useFetchSpecialAuthorizations(companyId);
  const isNoFeePermitType = Boolean(specialAuth?.noFeeType);

  const { data: companyInfo } = useCompanyInfoDetailsQuery(companyId);
  const doingBusinessAs = companyInfo?.alternateName;

  const fee = isNoFeePermitType
    ? "0"
    : `${calculateFeeByDuration(
        getDefaultRequiredVal(DEFAULT_PERMIT_TYPE, applicationData?.permitType),
        getDefaultRequiredVal(0, applicationData?.permitData?.permitDuration),
      )}`;

  const navigate = useNavigate();

  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const methods = useForm<Application>();

  // For the confirmation checkboxes
  // For Applications in Queue review, confirmation checkboxes are checked and disabled by default
  const [allConfirmed, setAllConfirmed] = useState(true);
  const [hasAttemptedSubmission, setHasAttemptedSubmission] = useState(false);

  const handleEdit = () => {
    return;
  };

  const isSuccess = (status?: number) => status === 201;

  const {
    mutateAsync: updateApplication,
    data: updateApplicationResponse,
    isPending: updateApplicationMutationPending,
  } = useUpdateApplicationInQueueStatus();

  const handleApprove = async (): Promise<void> => {
    setHasAttemptedSubmission(true);

    await updateApplication({
      applicationId,
      companyId,
      caseActivityType: CASE_ACTIVITY_TYPES.APPROVED,
    });
  };

  const [showRejectApplicationModal, setShowRejectApplicationModal] =
    useState<boolean>(false);

  const handleRejectButton = () => {
    setShowRejectApplicationModal(true);
  };

  const handleReject = async (comment: string): Promise<void> => {
    setHasAttemptedSubmission(true);

    await updateApplication({
      applicationId,
      companyId,
      caseActivityType: CASE_ACTIVITY_TYPES.REJECTED,
      comment,
    });
  };

  const updateApplicationResponseStatus = updateApplicationResponse?.status;

  useEffect(() => {
    if (isSuccess(updateApplicationResponseStatus)) {
      navigate(IDIR_ROUTES.STAFF_HOME);
    }
  }, [updateApplicationResponseStatus, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="application-in-queue-review">
      <QueueBreadcrumb
        applicationNumber={applicationData?.applicationNumber}
        applicationStep={APPLICATION_STEPS.REVIEW}
      />

      <FormProvider {...methods}>
        <PermitReview
          reviewContext={PERMIT_REVIEW_CONTEXTS.QUEUE}
          permitType={applicationData?.permitType}
          permitNumber={applicationData?.permitNumber}
          applicationNumber={applicationData?.applicationNumber}
          isAmendAction={false}
          permitStartDate={applicationData?.permitData?.startDate}
          permitDuration={applicationData?.permitData?.permitDuration}
          permitExpiryDate={applicationData?.permitData?.expiryDate}
          permitConditions={applicationData?.permitData?.commodities}
          createdDateTime={applicationData?.createdDateTime}
          updatedDateTime={applicationData?.updatedDateTime}
          companyInfo={companyInfo}
          contactDetails={applicationData?.permitData?.contactDetails}
          onEdit={handleEdit}
          handleApproveButton={handleApprove}
          updateApplicationMutationPending={updateApplicationMutationPending}
          handleRejectButton={handleRejectButton}
          allConfirmed={allConfirmed}
          setAllConfirmed={setAllConfirmed}
          hasAttemptedCheckboxes={hasAttemptedSubmission}
          powerUnitSubTypes={powerUnitSubTypesQuery.data}
          trailerSubTypes={trailerSubTypesQuery.data}
          vehicleDetails={applicationData?.permitData?.vehicleDetails}
          vehicleWasSaved={
            applicationData?.permitData?.vehicleDetails?.saveVehicle
          }
          doingBusinessAs={doingBusinessAs}
          calculatedFee={fee}
        />
      </FormProvider>
      {showRejectApplicationModal && (
        <RejectApplicationModal
          showModal={showRejectApplicationModal}
          onCancel={() => setShowRejectApplicationModal(false)}
          onConfirm={handleReject}
          isPending={updateApplicationMutationPending}
        />
      )}
    </div>
  );
};
