import { Box } from "@mui/material";
import { AxiosError } from "axios";
import { Navigate, useParams } from "react-router-dom";
import { useMemo } from "react";

import "../../../../common/components/dashboard/Dashboard.scss";
import { Banner } from "../../../../common/components/dashboard/components/banner/Banner";
import { ApplicationForm } from "../../pages/Application/ApplicationForm";
import { ApplicationContext } from "../../context/ApplicationContext";
import { ApplicationPay } from "../../pages/Application/ApplicationPay";
import { ApplicationReview } from "../../pages/Application/ApplicationReview";
import { useCompanyInfoQuery } from "../../../manageProfile/apiManager/hooks";
import { Loading } from "../../../../common/pages/Loading";
import { ErrorFallback } from "../../../../common/pages/ErrorFallback";
import { useApplicationDetailsQuery } from "../../hooks/hooks";
import { PERMIT_STATUSES } from "../../types/PermitStatus";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { DEFAULT_PERMIT_TYPE, PermitType, isPermitTypeValid } from "../../types/PermitType";
import {
  APPLICATION_STEPS,
  ApplicationStep,
  ERROR_ROUTES,
} from "../../../../routes/constants";

const displayHeaderText = (stepKey: ApplicationStep) => {
  switch (stepKey) {
    case APPLICATION_STEPS.DETAILS:
      return "Permit Application";
    case APPLICATION_STEPS.REVIEW:
      return "Review and Confirm Details";
    case APPLICATION_STEPS.PAY:
      return "Pay for Permit";
    case APPLICATION_STEPS.HOME:
    default:
      return "Permits";
  }
};

export const ApplicationStepPage = ({
  applicationStep,
}: {
  applicationStep: ApplicationStep;
}) => {
  const companyInfoQuery = useCompanyInfoQuery();

  // Get application number from route, if there is one (for edit applications)
  // or get the permit type for creating a new application
  const { permitId, permitType } = useParams();

  // Query for the application data whenever this page is rendered
  const {
    applicationData,
    setApplicationData,
    shouldEnableQuery,
    isInvalidRoute,
  } = useApplicationDetailsQuery(applicationStep, permitId, permitType);

  const contextData = useMemo(
    () => ({
      applicationData,
      setApplicationData,
    }),
    [applicationData, setApplicationData],
  );

  const isLoading = shouldEnableQuery && typeof applicationData === "undefined";

  const isInvalidApplication =
    (typeof applicationData !== "undefined" && !applicationData) ||
    isInvalidRoute;

  const applicationPermitType = getDefaultRequiredVal(
    DEFAULT_PERMIT_TYPE,
    isPermitTypeValid(permitType) ? permitType?.toUpperCase() as PermitType : null,
    applicationData?.permitType,
  );

  // Permit must be an application in order to allow application-related steps
  // (ie. empty status for new application, or in progress or incomplete payment status)
  const isValidApplicationStatus = () => {
    return (
      !isInvalidApplication &&
      (!applicationData?.permitStatus ||
        applicationData?.permitStatus === PERMIT_STATUSES.IN_PROGRESS ||
        applicationData?.permitStatus === PERMIT_STATUSES.WAITING_PAYMENT)
    );
  };

  const renderApplicationStep = () => {
    switch (applicationStep) {
      case APPLICATION_STEPS.REVIEW:
        return <ApplicationReview />;
      case APPLICATION_STEPS.PAY:
        return <ApplicationPay />;
      default:
        return <ApplicationForm permitType={applicationPermitType} />;
    }
  };

  if (isInvalidApplication || !isValidApplicationStatus()) {
    return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
  }

  if (companyInfoQuery.isPending) {
    return <Loading />;
  }

  if (companyInfoQuery.isError) {
    if (companyInfoQuery.error instanceof AxiosError) {
      if (companyInfoQuery.error.response?.status === 401) {
        return <Navigate to={ERROR_ROUTES.UNAUTHORIZED} />;
      }
      return <ErrorFallback error={companyInfoQuery.error.message} />;
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ApplicationContext.Provider value={contextData}>
      <Box
        className="layout-box"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Banner bannerText={displayHeaderText(applicationStep)} />
      </Box>

      {renderApplicationStep()}
    </ApplicationContext.Provider>
  );
};
