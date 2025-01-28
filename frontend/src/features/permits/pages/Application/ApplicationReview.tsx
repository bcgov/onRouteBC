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
import { calculateFeeByDuration } from "../../helpers/feeSummary";
import { DEFAULT_PERMIT_TYPE, PERMIT_TYPES } from "../../types/PermitType";
import { PERMIT_REVIEW_CONTEXTS } from "../../types/PermitReviewContext";
import { usePolicyEngine } from "../../../policy/hooks/usePolicyEngine";
import { useCommodityOptions } from "../../hooks/useCommodityOptions";
import { useSubmitApplicationForReview } from "../../../queue/hooks/hooks";
import { deserializeApplicationResponse } from "../../helpers/serialize/deserializeApplication";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import {
  APPLICATIONS_ROUTES,
  APPLICATION_STEPS,
  ERROR_ROUTES,
} from "../../../../routes/constants";

export const ApplicationReview = ({
  companyId,
}: {
  companyId: number;
}) => {
  const { applicationData, setApplicationData: setApplicationContextData } =
    useContext(ApplicationContext);

  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isStaffUser = Boolean(idirUserDetails?.userRole);

  const { data: specialAuth } = useFetchSpecialAuthorizations(companyId);
  const isNoFeePermitType = Boolean(specialAuth?.noFeeType);

  const { data: companyInfo } = useCompanyInfoDetailsQuery(companyId);
  const doingBusinessAs = companyInfo?.alternateName;

  const permitType = getDefaultRequiredVal(DEFAULT_PERMIT_TYPE, applicationData?.permitType);
  const fee = isNoFeePermitType
    ? "0"
    : `${calculateFeeByDuration(
        permitType,
        getDefaultRequiredVal(0, applicationData?.permitData?.permitDuration),
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

  // For the confirmation checkboxes
  const [allConfirmed, setAllConfirmed] = useState(false);
  const [hasAttemptedSubmission, setHasAttemptedSubmission] = useState(false);

  const { mutateAsync: saveApplication } = useSaveApplicationMutation();
  const addToCartMutation = useAddToCart();

  // Submit for review (if applicable)
  const {
    mutateAsync: submitForReview,
  } = useSubmitApplicationForReview();

  const back = () => {
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

    await saveApplication({
      data: {
        ...applicationData,
        permitData: {
          ...applicationData.permitData,
          doingBusinessAs, // always set most recent DBA from company info
        },
      },
      companyId,
    }, {
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
    });
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
    await handleSaveApplication(async (companyId, permitId, applicationNumber) => {
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
    });
  };

  const continueBtnText = permitType === PERMIT_TYPES.STOS && !isStaffUser
    ? "Submit for Review" : undefined;

  const handleSubmitForReview = async () => {
    if (permitType !== PERMIT_TYPES.STOS) return;
    if (isStaffUser) return;

    await handleSaveApplication(async (companyId, permitId, applicationNumber) => {
      await submitForReview({
        companyId,
        applicationId: permitId,
      }, {
        onSuccess: () => {
          setSnackBar({
            showSnackbar: true,
            setShowSnackbar,
            message: `Application ${applicationNumber} submitted for review`,
            alertType: "success",
          });
  
          navigate(APPLICATIONS_ROUTES.BASE);
        },
        onError: () => {
          navigate(ERROR_ROUTES.UNEXPECTED);
        },
      });
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="application-review">
      <ApplicationBreadcrumb
        permitId={permitId}
        applicationStep={APPLICATION_STEPS.REVIEW}
      />

      <FormProvider {...methods}>
        <PermitReview
          reviewContext={PERMIT_REVIEW_CONTEXTS.APPLY}
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
          onEdit={back}
          continueBtnText={continueBtnText}
          onContinue={handleSubmitForReview}
          onAddToCart={handleAddToCart}
          allConfirmed={allConfirmed}
          setAllConfirmed={setAllConfirmed}
          hasAttemptedCheckboxes={hasAttemptedSubmission}
          powerUnitSubTypes={powerUnitSubTypesQuery.data}
          trailerSubTypes={trailerSubTypesQuery.data}
          vehicleDetails={applicationData?.permitData?.vehicleDetails}
          vehicleWasSaved={
            applicationData?.permitData?.vehicleDetails?.saveVehicle
          }
          vehicleConfiguration={applicationData?.permitData?.vehicleConfiguration}
          route={applicationData?.permitData?.permittedRoute}
          applicationNotes={applicationData?.permitData?.applicationNotes}
          doingBusinessAs={doingBusinessAs}
          calculatedFee={fee}
          loas={applicationData?.permitData?.loas}
          applicationRejectionHistory={applicationData?.rejectionHistory}
          isStaffUser={isStaffUser}
        />
      </FormProvider>
    </div>
  );
};
