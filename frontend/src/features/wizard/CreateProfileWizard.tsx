import React from "react";
import { CreateProfileSteps } from "./components/dashboard/CreateProfileSteps";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../common/pages/ErrorFallback";

export const CreateProfileWizard = React.memo(() => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CreateProfileSteps />
    </ErrorBoundary>
  );
});

CreateProfileWizard.displayName = "CreateProfileWizard";
