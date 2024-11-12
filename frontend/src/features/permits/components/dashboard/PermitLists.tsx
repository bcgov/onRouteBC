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

export const PermitLists = React.memo(() => {
  const tabs = [];

  const companyId: number = applyWhenNotNullable(
    id => Number(id),
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
    });
  }

  tabs.push(
    {
      label: "Active Permits",
      component: <ActivePermitList />,
    },
    {
      label: "Expired Permits",
      component: <ExpiredPermitList />,
    },
  );

  return (
    <TabLayout
      bannerText="Permits"
      bannerButton={
        <RenderIf
          component={<StartApplicationAction />}
          permissionMatrixKeys={{
            permissionMatrixFeatureKey: "MANAGE_PERMITS",
            permissionMatrixFunctionKey: "START_APPLICATION",
          }}
        />
      }
      componentList={tabs}
    />
  );
});

PermitLists.displayName = "PermitLists";
