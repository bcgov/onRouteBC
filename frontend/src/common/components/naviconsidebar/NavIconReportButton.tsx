import { useLocation, useNavigate } from "react-router-dom";

import { NavButton } from "./NavButton";
import { NAV_BUTTON_TYPES } from "./types/NavButtonType";
import { IDIR_ROUTES } from "../../../routes/constants";

/**
 * Displays the navigation icon for Reports on the NavIconSideBar
 */
export const NavIconReportButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === IDIR_ROUTES.REPORTS;

  return (
    <NavButton
      type={NAV_BUTTON_TYPES.REPORT}
      onClick={() => navigate(IDIR_ROUTES.REPORTS)}
      isActive={isActive}
    />
  );
};
