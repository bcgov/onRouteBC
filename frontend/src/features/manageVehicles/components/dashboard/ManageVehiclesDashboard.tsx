import { useLocation } from "react-router-dom";
import { memo } from "react";

import "./ManageVehiclesDashboard.scss";
import { TabLayout } from "../../../../common/components/dashboard/TabLayout";
import { AddVehicleButton } from "./AddVehicleButton";
import { List } from "../list/List";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { applyWhenNotNullable } from "../../../../common/helpers/util";
import { VEHICLES_DASHBOARD_TABS } from "../../../../routes/constants";
import { VEHICLE_TYPES } from "../../types/Vehicle";
import { usePowerUnitsQuery } from "../../hooks/powerUnits";
import { useTrailersQuery } from "../../hooks/trailers";
import { RenderIf } from "../../../../common/components/reusable/RenderIf";

/**
 * Returns the selected tab index (if there is one)
 * @returns A number indicating the selected tab. Defaults to 0.
 */
const useTabIndexFromURL = (): number => {
  const { hash: selectedTab } = useLocation();
  switch (selectedTab) {
    case VEHICLES_DASHBOARD_TABS.TRAILER:
      return 1;
    case VEHICLES_DASHBOARD_TABS.VEHICLE_CONFIG:
      return 2;
    case VEHICLES_DASHBOARD_TABS.POWER_UNIT:
    default:
      return 0;
  }
};

/**
 * React component to render the vehicle inventory
 */
export const ManageVehiclesDashboard = memo(() => {
  const companyId: number = applyWhenNotNullable(
    (id) => Number(id),
    getCompanyIdFromSession(),
    0,
  );

  const staleTime = 5000;
  const powerUnitsQuery = usePowerUnitsQuery(companyId, staleTime);
  const trailersQuery = useTrailersQuery(companyId, staleTime);

  const tabs = [
    {
      label: "Power Unit",
      component: (
        <List
          vehicleType={VEHICLE_TYPES.POWER_UNIT}
          query={powerUnitsQuery}
          companyId={companyId}
        />
      ),
    },
    {
      label: "Trailer",
      component: (
        <List
          vehicleType={VEHICLE_TYPES.TRAILER}
          query={trailersQuery}
          companyId={companyId}
        />
      ),
    },
  ];

  return (
    <TabLayout
      bannerText="Vehicle Inventory"
      selectedTabIndex={useTabIndexFromURL()}
      bannerButton={
        <RenderIf
          component={<AddVehicleButton />}
          permissionMatrixKeys={{
            permissionMatrixFeatureKey: "MANAGE_VEHICLE_INVENTORY",
            permissionMatrixFunctionKey: "ADD_VEHICLE",
          }}
        />
      }
      componentList={tabs}
    />
  );
});

ManageVehiclesDashboard.displayName = "ManageVehiclesDashboard";
