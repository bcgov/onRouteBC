import { Banner } from "../../common/components/dashboard/components/banner/Banner";
import {
  getNavButtonTitle,
  NAV_BUTTON_TYPES,
} from "../../common/components/naviconsidebar/types/NavButtonType";
import { Box } from "@mui/material";
import { InfoBcGovBanner } from "../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../common/constants/bannerMessages";
import "./BFCTDashboard.scss";
import { BridgeFormulaCalculationTool } from "./components/BridgeFormulaCalculationTool";
import { useFeatureFlagsQuery } from "../../common/hooks/hooks";
import { Navigate } from "react-router-dom";
import { ERROR_ROUTES } from "../../routes/constants";

export const BFCTDashboard = () => {
  const { data: featureFlags } = useFeatureFlagsQuery();
  const enableBFCT =
    featureFlags?.["BRIDGE-FORMULA-CALCULATION-TOOL"] === "ENABLED";

  return enableBFCT ? (
    <>
      <Box className="layout-box">
        <Banner bannerText={getNavButtonTitle(NAV_BUTTON_TYPES.BFCT)} />
      </Box>
      <div
        className="bfct-dashboard"
        role="tabpanel"
        id={"bfct-dashboard"}
        aria-labelledby={"bfct-dashboard"}
      >
        <div className="bfct-dashboard__split">
          <InfoBcGovBanner
            className="bfct-dashboard__info-banner"
            msg={BANNER_MESSAGES.BRIDGE_FORMULA_CALCULATION_TOOL}
          />
          <img
            className="bfct-dashboard__image"
            src="/Bridge_Formula_Calculation_Tool_Diagram.png"
            alt="Diagram of a truck illustrating the properties requrired for the bridge calculation tool"
          />
        </div>
        <BridgeFormulaCalculationTool />
      </div>
    </>
  ) : (
    <Navigate to={ERROR_ROUTES.UNEXPECTED} />
  );
};

BFCTDashboard.displayName = "BridgeFormulaCalculationToolDashboard";
