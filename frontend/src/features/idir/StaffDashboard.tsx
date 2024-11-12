import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ApplicationQueueLists } from "../queue/components/ApplicationQueueLists";
import { ErrorFallback } from "../../common/pages/ErrorFallback";

export const StaffDashboard = React.memo(() => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ApplicationQueueLists />
    </ErrorBoundary>
  );
});

StaffDashboard.displayName = "StaffDashboard";
