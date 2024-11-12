import React from "react";
import { usePermissionMatrix } from "../../../common/authentication/PermissionMatrix";
import { TabLayout } from "../../../common/components/dashboard/TabLayout";
import { ApplicationsInQueueList } from "./ApplicationsInQueueList";
import { ClaimedApplicationsList } from "./ClaimedApplicationsList";

export const ApplicationQueueLists = React.memo(() => {
  const tabs = [];

  const showApplicationsInQueueTab = usePermissionMatrix({
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "STAFF_HOME_SCREEN",
      permissionMatrixFunctionKey: "VIEW_QUEUE",
    },
  });

  if (showApplicationsInQueueTab) {
    tabs.push({
      label: "Applications In Queue",
      component: <ApplicationsInQueueList />,
    });
  }

  const showClaimedApplicationsTab = usePermissionMatrix({
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "STAFF_HOME_SCREEN",
      permissionMatrixFunctionKey: "VIEW_QUEUE",
    },
  });

  if (showClaimedApplicationsTab) {
    tabs.push({
      label: "Claimed Applications",
      component: <ClaimedApplicationsList />,
    });
  }

  return <TabLayout bannerText="Home" componentList={tabs} />;
});

ApplicationQueueLists.displayName = "ApplicationQueueLists";
