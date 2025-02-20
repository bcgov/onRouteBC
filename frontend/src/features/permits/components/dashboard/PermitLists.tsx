import React from "react";

import { TabLayout } from "../../../../common/components/dashboard/TabLayout";
import { StartApplicationAction } from "../../pages/Application/components/dashboard/StartApplicationAction";
import { ActivePermitList } from "../permit-list/ActivePermitList";
import { ExpiredPermitList } from "../permit-list/ExpiredPermitList";
import { ApplicationsInProgressList } from "../permit-list/ApplicationsInProgressList";
import { ApplicationsInReviewList } from "../permit-list/ApplicationsInReviewList";
import { usePermissionMatrix } from "../../../../common/authentication/PermissionMatrix";
import { RenderIf } from "../../../../common/components/reusable/RenderIf";
import { applyWhenNotNullable } from "../../../../common/helpers/util";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { PERMIT_TABS } from "../../types/PermitTabs";
import { DashboardTab } from "../../../../common/types/common";
import { useLocation } from "react-router-dom";

export const PermitLists = React.memo(() => {
  const tabs: DashboardTab[] = [];

  const companyId: number = applyWhenNotNullable(
    (id) => Number(id),
    getCompanyIdFromSession(),
    0,
  );

  const showApplicationsInProgressTab = usePermissionMatrix({
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_PERMITS",
      permissionMatrixFunctionKey: "VIEW_LIST_OF_APPLICATIONS_IN_PROGRESS",
    },
  });

  if (showApplicationsInProgressTab) {
    tabs.push({
      label: "Applications in Progress",
      component: <ApplicationsInProgressList companyId={companyId} />,
      componentKey: PERMIT_TABS.APPLICATIONS_IN_PROGRESS,
    });
  }

  const showApplicationsInReviewTab = usePermissionMatrix({
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_PERMITS",
      permissionMatrixFunctionKey: "VIEW_LIST_OF_APPLICATIONS_IN_REVIEW",
    },
  });

  if (showApplicationsInReviewTab) {
    tabs.push({
      label: "Applications in Review",
      component: <ApplicationsInReviewList />,
      componentKey: PERMIT_TABS.APPLICATIONS_IN_REVIEW,
    });
  }

  tabs.push(
    {
      label: "Active Permits",
      component: <ActivePermitList />,
      componentKey: PERMIT_TABS.ACTIVE_PERMITS,
    },
    {
      label: "Expired Permits",
      component: <ExpiredPermitList />,
      componentKey: PERMIT_TABS.EXPIRED_PERMITS,
    },
  );

  const { state: stateFromNavigation } = useLocation();

  const getSelectedTabFromNavigation = (): number => {
    const tabIndex = tabs.findIndex(
      ({ componentKey }) => componentKey === stateFromNavigation?.selectedTab,
    );
    if (tabIndex < 0) return 0;
    return tabIndex;
  };

  const initialSelectedTabIndex = getSelectedTabFromNavigation();

  return (
    <TabLayout
      bannerText="Permits"
      componentList={tabs}
      selectedTabIndex={initialSelectedTabIndex}
      bannerButton={
        <RenderIf
          component={<StartApplicationAction />}
          permissionMatrixKeys={{
            permissionMatrixFeatureKey: "MANAGE_PERMITS",
            permissionMatrixFunctionKey: "START_APPLICATION",
          }}
        />
      }
    />
  );
});

PermitLists.displayName = "PermitLists";
