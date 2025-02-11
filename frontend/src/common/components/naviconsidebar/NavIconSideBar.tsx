import { useAuth } from "react-oidc-context";
import React, { useContext } from "react";

import { IDPS } from "../../types/idp";
import "./NavIconSideBar.scss";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { USER_ROLE } from "../../../common/authentication/types";
import { NavIconHomeButton } from "./NavIconHomeButton";
import { NavIconReportButton } from "./NavIconReportButton";
import { NavIconBFCTButton } from "./NavIconBFCTButton";
import { useFeatureFlagsQuery } from "../../hooks/hooks";

/**
 * Displays a sidebar with NavIcon buttons as children
 */
export const NavIconSideBar = () => {
  const { isAuthenticated, user } = useAuth();
  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isIdir = user?.profile?.identity_provider === IDPS.IDIR;
  const isEofficer =
    idirUserDetails?.userRole === USER_ROLE.ENFORCEMENT_OFFICER;

  const shouldShowSideBar =
    isAuthenticated && isIdir && idirUserDetails?.userName && !isEofficer;

  // Determine when to hide the BridgeFormulaCalculationTool button based on its corresponding feature flag
  const { data: featureFlags } = useFeatureFlagsQuery();
  const enableBFCT =
    featureFlags?.["BRIDGE-FORMULA-CALCULATION-TOOL"] === "ENABLED";

  return shouldShowSideBar ? (
    <div className="nav-icon-side-bar">
      <NavIconHomeButton />
      <NavIconReportButton />
      {enableBFCT && <NavIconBFCTButton />}
    </div>
  ) : null;
};
