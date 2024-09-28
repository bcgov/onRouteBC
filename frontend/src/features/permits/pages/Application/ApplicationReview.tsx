import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import "./ApplicationReview.scss";
import { ApplicationContext } from "../../context/ApplicationContext";
import { Application } from "../../types/application";
import { useSaveApplicationMutation } from "../../hooks/hooks";
import { ApplicationBreadcrumb } from "../../components/application-breadcrumb/ApplicationBreadcrumb";
import { useCompanyInfoQuery } from "../../../manageProfile/apiManager/hooks";
import { PermitReview } from "./components/review/PermitReview";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../common/helpers/util";
import { SnackBarContext } from "../../../../App";
import { useAddToCart } from "../../hooks/cart";
import { hasPermitsActionFailed } from "../../helpers/permitState";
import { CartContext } from "../../context/CartContext";
import { usePowerUnitSubTypesQuery } from "../../../manageVehicles/hooks/powerUnits";
import { useTrailerSubTypesQuery } from "../../../manageVehicles/hooks/trailers";
import { useFetchSpecialAuthorizations } from "../../../settings/hooks/specialAuthorizations";
import { applyLCVToApplicationData } from "../../helpers/getDefaultApplicationFormData";
import { calculateFeeByDuration } from "../../helpers/feeSummary";
import { DEFAULT_PERMIT_TYPE } from "../../types/PermitType";
import {
  APPLICATIONS_ROUTES,
  APPLICATION_STEPS,
  ERROR_ROUTES,
} from "../../../../routes/constants";

export const ApplicationReview = () => {
  const {
    applicationData: applicationContextData,
    setApplicationData: setApplicationContextData,
  } = useContext(ApplicationContext);

  const companyId = applyWhenNotNullable(
    id => `${id}`,
    applicationContextData?.companyId,
    "",
  ) as string;

  const { data: specialAuth } = useFetchSpecialAuthorizations(companyId);
  const isLcvDesignated = Boolean(specialAuth?.isLcvAllowed);
  const isNoFeePermitType = Boolean(specialAuth?.noFeeType);

  const { data: companyInfo } = useCompanyInfoQuery();
  const doingBusinessAs = companyInfo?.alternateName;
  
  const applicationData = applyLCVToApplicationData(
    applicationContextData,
    isLcvDesignated,
  );

  const fee = isNoFeePermitType
    ? "0"
    : `${calculateFeeByDuration(
      getDefaultRequiredVal(DEFAULT_PERMIT_TYPE, applicationData?.permitType),
      getDefaultRequiredVal(0, applicationData?.permitData?.permitDuration),
    )}`;

  const { setSnackBar } = useContext(SnackBarContext);
  const { refetchCartCount } = useContext(CartContext);

  const routeParams = useParams();
  const permitId = getDefaultRequiredVal("", routeParams.permitId);

  const navigate = useNavigate();

  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const methods = useForm<Application>();

  // For the confirmation checkboxes
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Send data to the backend API
  const saveApplicationMutation = useSaveApplicationMutation();
  const addToCartMutation = useAddToCart();

  const back = () => {
    navigate(APPLICATIONS_ROUTES.DETAILS(permitId), { replace: true });
  };

  const proceedWithAddToCart = async (
    companyId: string,
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

  const handleAddToCart = async () => {
    setIsSubmitted(true);

    if (!isChecked) return;

    const companyId = applicationData?.companyId;
    const permitId = applicationData?.permitId;
    const applicationNumber = applicationData?.applicationNumber;
    if (!companyId || !permitId || !applicationNumber) {
      return navigate(ERROR_ROUTES.UNEXPECTED);
    }

    const { application: savedApplication } =
      await saveApplicationMutation.mutateAsync({
        ...applicationData,
        permitData: {
          ...applicationData.permitData,
          doingBusinessAs, // always set most recent DBA from company info
        }
      });

    if (savedApplication) {
      setApplicationContextData(savedApplication);

      await proceedWithAddToCart(
        `${companyId}`,
        [permitId],
        () => {
          setSnackBar({
            showSnackbar: true,
            setShowSnackbar: () => true,
            message: `Application ${applicationNumber} added to cart`,
            alertType: "success",
          });
    
          refetchCartCount();
          navigate(APPLICATIONS_ROUTES.BASE);
        },
      );
    } else {
      navigate(ERROR_ROUTES.UNEXPECTED);
    }
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
          onEdit={back}
          onAddToCart={handleAddToCart}
          allChecked={isChecked}
          setAllChecked={setIsChecked}
          hasAttemptedCheckboxes={isSubmitted}
          powerUnitSubTypes={powerUnitSubTypesQuery.data}
          trailerSubTypes={trailerSubTypesQuery.data}
          vehicleDetails={applicationData?.permitData?.vehicleDetails}
          vehicleWasSaved={
            applicationData?.permitData?.vehicleDetails?.saveVehicle
          }
          doingBusinessAs={doingBusinessAs}
          calculatedFee={fee}
          loas={applicationData?.permitData?.loas}
        />
      </FormProvider>
    </div>
  );
};
