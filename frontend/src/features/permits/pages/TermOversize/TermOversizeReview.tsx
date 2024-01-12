import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import "./TermOversizeReview.scss";
import { ApplicationContext } from "../../context/ApplicationContext";
import { Application } from "../../types/application";
import { useSaveTermOversizeMutation } from "../../hooks/hooks";
import { ApplicationBreadcrumb } from "../../components/application-breadcrumb/ApplicationBreadcrumb";
import { useCompanyInfoQuery } from "../../../manageProfile/apiManager/hooks";
import { PermitReview } from "./components/review/PermitReview";
import {
  APPLICATIONS_ROUTES,
  APPLICATION_STEPS,
  ERROR_ROUTES,
} from "../../../../routes/constants";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import {
  usePowerUnitSubTypesQuery,
  useTrailerSubTypesQuery,
} from "../../../manageVehicles/apiManager/hooks";

export const TermOversizeReview = () => {
  const { applicationData, setApplicationData } =
    useContext(ApplicationContext);

  const routeParams = useParams();
  const permitId = getDefaultRequiredVal("", routeParams.permitId);

  const navigate = useNavigate();

  const companyQuery = useCompanyInfoQuery();
  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const methods = useForm<Application>();

  // For the confirmation checkboxes
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Send data to the backend API
  const submitTermOversizeMutation = useSaveTermOversizeMutation();

  const saveApplicationSuccessful = (responseStatus: number) => {
    return responseStatus === 200 || responseStatus === 201;
  };

  const back = () => {
    navigate(APPLICATIONS_ROUTES.DETAILS(permitId), { replace: true });
  };

  const next = () => {
    navigate(APPLICATIONS_ROUTES.PAY(permitId));
  };

  const onSubmit = async () => {
    setIsSubmitted(true);

    if (!isChecked) return;

    if (!applicationData) {
      return navigate(ERROR_ROUTES.UNEXPECTED);
    }

    const response =
      await submitTermOversizeMutation.mutateAsync(applicationData);

    const { data, status } = response;
    setApplicationData(data);

    if (saveApplicationSuccessful(status)) {
      next();
    } else {
      navigate(ERROR_ROUTES.UNEXPECTED);
    }

    next();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="term-oversize-review">
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
          companyInfo={companyQuery.data}
          contactDetails={applicationData?.permitData?.contactDetails}
          continueBtnText="Proceed To Pay"
          onEdit={back}
          onContinue={methods.handleSubmit(onSubmit)}
          allChecked={isChecked}
          setAllChecked={setIsChecked}
          hasAttemptedCheckboxes={isSubmitted}
          powerUnitSubTypes={powerUnitSubTypesQuery.data}
          trailerSubTypes={trailerSubTypesQuery.data}
          vehicleDetails={applicationData?.permitData?.vehicleDetails}
          vehicleWasSaved={
            applicationData?.permitData?.vehicleDetails?.saveVehicle
          }
        />
      </FormProvider>
    </div>
  );
};
