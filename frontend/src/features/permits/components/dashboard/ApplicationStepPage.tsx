import { Box } from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import { useMemo } from "react";

import "../../../../common/components/dashboard/Dashboard.scss";
import { Banner } from "../../../../common/components/dashboard/components/banner/Banner";
import { ApplicationForm } from "../../pages/Application/ApplicationForm";
import { ApplicationContext } from "../../context/ApplicationContext";
import { ApplicationReview } from "../../pages/Application/ApplicationReview";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { Loading } from "../../../../common/pages/Loading";
import { ApplicationInQueueReview } from "../../../queue/components/ApplicationInQueueReview";
import { useApplicationForStepsQuery } from "../../hooks/hooks";
import { PERMIT_STATUSES } from "../../types/PermitStatus";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../common/helpers/util";
import { useFeatureFlagsQuery } from "../../../../common/hooks/hooks";
import {
  DEFAULT_PERMIT_TYPE,
  PERMIT_TYPES,
  PermitType,
  isPermitTypeValid,
} from "../../types/PermitType";

import {
  APPLICATION_STEP_CONTEXTS,
  APPLICATION_STEPS,
  ApplicationStep,
  ApplicationStepContext,
  ERROR_ROUTES,
} from "../../../../routes/constants";

const displayHeaderText = (stepKey: ApplicationStep) => {
  switch (stepKey) {
    case APPLICATION_STEPS.DETAILS:
      return "Permit Application";
    case APPLICATION_STEPS.REVIEW:
      return "Review and Confirm Details";
    case APPLICATION_STEPS.HOME:
    default:
      return "Permits";
  }
};

export const ApplicationStepPage = ({
  applicationStep,
  applicationStepContext,
}: {
  applicationStep: ApplicationStep;
  applicationStepContext: ApplicationStepContext;
}) => {
  // Get application number from route, if there is one (for edit applications)
  // or get the permit type for creating a new application
  const { permitId, permitType, companyId: companyIdParam } = useParams();

  const companyId: number = getDefaultRequiredVal(
    0,
    applyWhenNotNullable(id => Number(id), companyIdParam),
    applyWhenNotNullable(id => Number(id), getCompanyIdFromSession()),
  );

  const { data: featureFlags } = useFeatureFlagsQuery();
  const enableSTOS = featureFlags?.["STOS"] === "ENABLED";

  // Query for the application data whenever this page is rendered
  const {
    applicationData,
    setApplicationData,
    shouldEnableQuery,
    isInvalidRoute,
  } = useApplicationForStepsQuery({
    applicationStep,
    permitId,
    permitType,
    companyId,
  });

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
    isPermitTypeValid(permitType)
      ? (permitType?.toUpperCase() as PermitType)
      : null, // when permitType in the url param is empty or not a valid permit type
    applicationData?.permitType,
  );

  // Currently onRouteBC only handles TROS and TROW permits, and STOS only if feature flag is enabled
  const isPermitTypeAllowed = () => {
    const allowedPermitTypes: string[] = enableSTOS ? [
      PERMIT_TYPES.TROS,
      PERMIT_TYPES.TROW,
      PERMIT_TYPES.STOS,
    ] : [
      PERMIT_TYPES.TROS,
      PERMIT_TYPES.TROW,
    ];

    return allowedPermitTypes.includes(applicationPermitType);
  };

  // Permit must be an application in progress in order to allow application-related edit/review/add to cart steps
  // (ie. empty status for new application, or in progress and in queue)
  const isValidApplicationStatus = () => {
    return (
      !isInvalidApplication &&
      (!applicationData?.permitStatus ||
        applicationData?.permitStatus === PERMIT_STATUSES.IN_PROGRESS ||
        applicationData?.permitStatus === PERMIT_STATUSES.IN_QUEUE
      )
    );
  };

  const renderApplicationStep = () => {
    if (applicationStep === APPLICATION_STEPS.REVIEW) {
      return applicationStepContext === APPLICATION_STEP_CONTEXTS.QUEUE ? (
        <ApplicationInQueueReview applicationData={contextData.applicationData} />        
      ) : (
        <ApplicationReview
          companyId={companyId}
        />
      );
    }

    return (
      <ApplicationForm
        permitType={applicationPermitType}
        companyId={companyId}
      />
    );
  };

  if (isInvalidApplication || !isValidApplicationStatus() || !companyId || !isPermitTypeAllowed()) {
    return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
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
