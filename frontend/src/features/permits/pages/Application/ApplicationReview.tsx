import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";

import "./ApplicationReview.scss";
import { ApplicationContext } from "../../context/ApplicationContext";
import { Application } from "../../types/application";
import { useSaveApplicationMutation } from "../../hooks/hooks";
import { ApplicationBreadcrumb } from "../../components/application-breadcrumb/ApplicationBreadcrumb";
import { useCompanyInfoDetailsQuery } from "../../../manageProfile/apiManager/hooks";
import { PermitReview } from "./components/review/PermitReview";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { SnackBarContext } from "../../../../App";
import { useAddToCart } from "../../hooks/cart";
import { hasPermitsActionFailed } from "../../helpers/permitState";
import { CartContext } from "../../context/CartContext";
import { usePowerUnitSubTypesQuery } from "../../../manageVehicles/hooks/powerUnits";
import { useTrailerSubTypesQuery } from "../../../manageVehicles/hooks/trailers";
import { useFetchSpecialAuthorizations } from "../../../settings/hooks/specialAuthorizations";
import { calculatePermitFee } from "../../helpers/feeSummary";
import { DEFAULT_PERMIT_TYPE, PERMIT_TYPES } from "../../types/PermitType";
import { PERMIT_REVIEW_CONTEXTS } from "../../types/PermitReviewContext";
import { usePolicyEngine } from "../../../policy/hooks/usePolicyEngine";
import { useCommodityOptions } from "../../hooks/useCommodityOptions";
import { deserializeApplicationResponse } from "../../helpers/serialize/deserializeApplication";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import {
  APPLICATIONS_ROUTES,
  APPLICATION_QUEUE_ROUTES,
  APPLICATION_STEPS,
  APPLICATION_STEP_CONTEXTS,
  ApplicationStepContext,
  ERROR_ROUTES,
  IDIR_ROUTES,
} from "../../../../routes/constants";
import { CASE_ACTIVITY_TYPES } from "../../../queue/types/CaseActivityType";
import { QueueBreadcrumb } from "../../../queue/components/QueueBreadcrumb";
import { RejectApplicationModal } from "../../../queue/components/RejectApplicationModal";
import {
  useApplicationInQueueMetadata,
  useSubmitApplicationForReview,
  useUpdateApplicationInQueueStatus,
} from "../../../queue/hooks/hooks";
import { UnavailableApplicationModal } from "../../../queue/components/UnavailableApplicationModal";

export const ApplicationReview = ({
  applicationStepContext,
}: {
  applicationStepContext: ApplicationStepContext;
}) => {
  const { applicationData, setApplicationData: setApplicationContextData } =
    useContext(ApplicationContext);

  const isQueueContext =
    applicationStepContext === APPLICATION_STEP_CONTEXTS.QUEUE;

  const companyId = getDefaultRequiredVal(0, applicationData?.companyId);

  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isStaffUser = Boolean(idirUserDetails?.userRole);

  const { data: specialAuth } = useFetchSpecialAuthorizations(companyId);
  const isNoFeePermitType = Boolean(specialAuth?.noFeeType);

  const { data: companyInfo } = useCompanyInfoDetailsQuery(companyId);
  const doingBusinessAs = companyInfo?.alternateName;

  const permitType = getDefaultRequiredVal(
    DEFAULT_PERMIT_TYPE,
    applicationData?.permitType,
  );
  const fee = isNoFeePermitType
    ? "0"
    : `${calculatePermitFee(
        permitType,
        getDefaultRequiredVal(0, applicationData?.permitData?.permitDuration),
        applicationData?.permitData?.permittedRoute?.manualRoute?.totalDistance,
      )}`;

  const { setSnackBar } = useContext(SnackBarContext);
  const { refetchCartCount } = useContext(CartContext);

  const routeParams = useParams();
  const permitId = getDefaultRequiredVal("", routeParams.permitId);

  const navigate = useNavigate();

  const policyEngine = usePolicyEngine(specialAuth);
  const { commodityOptions } = useCommodityOptions(policyEngine, permitType);
  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const methods = useForm<Application>();

  const [allConfirmed, setAllConfirmed] = useState(isQueueContext);
  const [hasAttemptedSubmission, setHasAttemptedSubmission] = useState(false);

  const { mutateAsync: saveApplication } = useSaveApplicationMutation();
  const addToCartMutation = useAddToCart();
  const { mutateAsync: submitForReview } = useSubmitApplicationForReview();
  const {
    mutateAsync: updateApplication,
    data: updateApplicationResponse,
    isPending: updateApplicationMutationPending,
  } = useUpdateApplicationInQueueStatus();

  const { refetch: refetchApplicationMetadata } = useApplicationInQueueMetadata(
    {
      applicationId: getDefaultRequiredVal("", permitId),
      companyId,
    },
  );

  const [assignedUser, setAssignedUser] = useState<string>("");

  const [showUnavailableApplicationModal, setShowUnavailableApplicationModal] =
    useState<boolean>(false);

  const validateCurrentUser = async (onSuccess: () => void) => {
    const { data: applicationMetaData } = await refetchApplicationMetadata();

    if (idirUserDetails?.userName !== applicationMetaData?.assignedUser) {
      setAssignedUser(
        getDefaultRequiredVal("", applicationMetaData?.assignedUser),
      );
      setShowUnavailableApplicationModal(true);
    } else {
      onSuccess();
    }
  };

  const handleEdit = async () => {
    if (isQueueContext) {
      await validateCurrentUser(() =>
        navigate(
          APPLICATION_QUEUE_ROUTES.EDIT(companyId, applicationData?.permitId),
          {
            replace: true,
          },
        ),
      );
      return;
    }
    navigate(APPLICATIONS_ROUTES.DETAILS(permitId), { replace: true });
  };

  const handleSaveApplication = async (
    followUpAction: (
      companyId: number,
      permitId: string,
      applicationNumber: string,
    ) => Promise<void>,
  ) => {
    setHasAttemptedSubmission(true);

    if (!allConfirmed) return;

    const companyId = applicationData?.companyId;
    const permitId = applicationData?.permitId;
    const applicationNumber = applicationData?.applicationNumber;
    if (!companyId || !permitId || !applicationNumber) {
      return navigate(ERROR_ROUTES.UNEXPECTED);
    }

    await saveApplication(
      {
        data: {
          ...applicationData,
          permitData: {
            ...applicationData?.permitData,
            doingBusinessAs,
          },
        },
        companyId,
      },
      {
        onSuccess: ({ data: savedApplication }) => {
          setApplicationContextData(
            deserializeApplicationResponse(savedApplication),
          );
          followUpAction(companyId, permitId, applicationNumber);
        },
        onError: (e) => {
          console.error(e);
          if (isAxiosError(e)) {
            navigate(ERROR_ROUTES.UNEXPECTED, {
              state: {
                correlationId: e?.response?.headers["x-correlation-id"],
              },
            });
          } else {
            navigate(ERROR_ROUTES.UNEXPECTED);
          }
        },
      },
    );
  };

  const proceedWithAddToCart = async (
    companyId: number,
    applicationIds: string[],
    onSuccess: () => void,
  ) => {
    const addResult = await addToCartMutation.mutateAsync({
      companyId,
      applicationIds,
    });

    if (hasPermitsActionFailed(addResult)) {
      navigate(ERROR_ROUTES.UNEXPECTED);
    } else {
      onSuccess();
    }
  };

  const setShowSnackbar = () => true;

  const handleAddToCart = async () => {
    await handleSaveApplication(
      async (companyId, permitId, applicationNumber) => {
        await proceedWithAddToCart(companyId, [permitId], () => {
          setSnackBar({
            showSnackbar: true,
            setShowSnackbar,
            message: `Application ${applicationNumber} added to cart`,
            alertType: "success",
          });

          refetchCartCount();
          navigate(APPLICATIONS_ROUTES.BASE);
        });
      },
    );
  };
  const continueBtnText =
    permitType === PERMIT_TYPES.STOS && !isStaffUser
      ? "Submit for Review"
      : undefined;

  const handleSubmitForReview = async () => {
    if (permitType !== PERMIT_TYPES.STOS || isStaffUser) return;

    await handleSaveApplication(
      async (companyId, permitId, applicationNumber) => {
        await submitForReview({ companyId, applicationId: permitId });
        setSnackBar({
          showSnackbar: true,
          setShowSnackbar: () => true,
          message: `Application ${applicationNumber} submitted for review`,
          alertType: "success",
        });
        navigate(APPLICATIONS_ROUTES.BASE);
      },
    );
  };

  const handleApprove = async () => {
    await validateCurrentUser(async () => {
      setHasAttemptedSubmission(true);

      await updateApplication({
        applicationId: permitId,
        companyId,
        caseActivityType: CASE_ACTIVITY_TYPES.APPROVED,
      });
    });
  };

  const [showRejectApplicationModal, setShowRejectApplicationModal] =
    useState<boolean>(false);

  const handleRejectButton = async () => {
    await validateCurrentUser(() => setShowRejectApplicationModal(true));
  };

  const handleReject = async (comment: string) => {
    setHasAttemptedSubmission(true);
    await updateApplication({
      applicationId: permitId,
      companyId,
      caseActivityType: CASE_ACTIVITY_TYPES.REJECTED,
      comment,
    });
  };

  const updateApplicationResponseStatus = updateApplicationResponse?.status;

  const handleCloseApplication = () => {
    navigate(IDIR_ROUTES.STAFF_HOME);
  };

  const handleCloseUnavailableApplicationModal = () => {
    setShowUnavailableApplicationModal(false);
    showRejectApplicationModal && setShowRejectApplicationModal(false);
  };

  useEffect(() => {
    if (updateApplicationResponseStatus === 201) {
      navigate(IDIR_ROUTES.STAFF_HOME);
    }
  }, [updateApplicationResponse, updateApplicationResponseStatus, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="application-review">
      {isQueueContext ? (
        <QueueBreadcrumb
          applicationNumber={applicationData?.applicationNumber}
          applicationStep={APPLICATION_STEPS.REVIEW}
        />
      ) : (
        <ApplicationBreadcrumb
          permitId={permitId}
          applicationStep={APPLICATION_STEPS.REVIEW}
        />
      )}

      <FormProvider {...methods}>
        <PermitReview
          reviewContext={
            isQueueContext
              ? PERMIT_REVIEW_CONTEXTS.QUEUE
              : PERMIT_REVIEW_CONTEXTS.APPLY
          }
          permitType={permitType}
          permitNumber={applicationData?.permitNumber}
          applicationNumber={applicationData?.applicationNumber}
          isAmendAction={false}
          permitStartDate={applicationData?.permitData?.startDate}
          permitDuration={applicationData?.permitData?.permitDuration}
          permitExpiryDate={applicationData?.permitData?.expiryDate}
          permitConditions={applicationData?.permitData?.commodities}
          permittedCommodity={applicationData?.permitData?.permittedCommodity}
          commodityOptions={commodityOptions}
          createdDateTime={applicationData?.createdDateTime}
          updatedDateTime={applicationData?.updatedDateTime}
          companyInfo={companyInfo}
          contactDetails={applicationData?.permitData?.contactDetails}
          onEdit={handleEdit}
          continueBtnText={continueBtnText}
          onContinue={
            applicationStepContext === APPLICATION_STEP_CONTEXTS.APPLY
              ? handleSubmitForReview
              : undefined
          }
          onAddToCart={
            applicationStepContext === APPLICATION_STEP_CONTEXTS.APPLY
              ? handleAddToCart
              : undefined
          }
          handleApproveButton={isQueueContext ? handleApprove : undefined}
          handleRejectButton={isQueueContext ? handleRejectButton : undefined}
          updateApplicationMutationPending={
            isQueueContext ? updateApplicationMutationPending : undefined
          }
          allConfirmed={allConfirmed}
          setAllConfirmed={setAllConfirmed}
          hasAttemptedCheckboxes={hasAttemptedSubmission}
          powerUnitSubTypes={powerUnitSubTypesQuery.data}
          trailerSubTypes={trailerSubTypesQuery.data}
          vehicleDetails={applicationData?.permitData?.vehicleDetails}
          vehicleWasSaved={
            applicationData?.permitData?.vehicleDetails?.saveVehicle
          }
          vehicleConfiguration={
            applicationData?.permitData?.vehicleConfiguration
          }
          route={applicationData?.permitData?.permittedRoute}
          applicationNotes={applicationData?.permitData?.applicationNotes}
          doingBusinessAs={doingBusinessAs}
          calculatedFee={fee}
          loas={applicationData?.permitData?.loas}
          applicationRejectionHistory={applicationData?.rejectionHistory}
          isStaffUser={isStaffUser}
        />
      </FormProvider>

      {isQueueContext && showRejectApplicationModal && (
        <RejectApplicationModal
          showModal={showRejectApplicationModal}
          onCancel={() => setShowRejectApplicationModal(false)}
          onConfirm={handleReject}
          isPending={updateApplicationMutationPending}
        />
      )}

      {isQueueContext && showUnavailableApplicationModal && (
        <UnavailableApplicationModal
          showModal={showUnavailableApplicationModal}
          onCancel={handleCloseUnavailableApplicationModal}
          onConfirm={handleCloseApplication}
          assignedUser={assignedUser}
        />
      )}
    </div>
  );
};
