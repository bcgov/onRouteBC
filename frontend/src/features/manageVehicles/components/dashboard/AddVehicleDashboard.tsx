import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "./AddVehicleDashboard.scss";
import { Banner } from "../../../../common/components/dashboard/components/banner/Banner";
import { InfoBcGovBanner } from "../../../../common/components/banners/InfoBcGovBanner";
import { PowerUnitForm } from "../form/PowerUnitForm";
import { TrailerForm } from "../form/TrailerForm";
import { VEHICLES_ROUTES } from "../../../../routes/constants";
import { BANNER_MESSAGES } from "../../../../common/constants/bannerMessages";
import { VEHICLE_TYPES, VehicleType } from "../../types/Vehicle";
import { applyWhenNotNullable } from "../../../../common/helpers/util";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";

export const AddVehicleDashboard = React.memo(
  ({ vehicleType }: { vehicleType: VehicleType }) => {
    const navigate = useNavigate();
    const companyId: number = applyWhenNotNullable(id => Number(id), getCompanyIdFromSession(), 0);
    const isTrailer = vehicleType === VEHICLE_TYPES.TRAILER;
    
    const backToVehicleInventory = () => {
      if (isTrailer) {
        navigate(VEHICLES_ROUTES.TRAILER_TAB);
      } else {
        navigate(VEHICLES_ROUTES.MANAGE);
      }
    };

    const addText = isTrailer
      ? "Add Trailer" : "Add Power Unit";
    const backText = isTrailer
      ? "Trailer" : "Power Unit";
    const detailsText = isTrailer
      ? "Trailer Details" : "Power Unit Details";

    return (
      <div className="dashboard-page">
        <Box className="dashboard-page__banner layout-box">
          <Banner bannerText={addText} />
        </Box>

        <Box className="dashboard-page__breadcrumb layout-box">
          <Typography
            className="breadcrumb-link breadcrumb-link--parent"
            onClick={backToVehicleInventory}
          >
            Vehicle Inventory
          </Typography>

          <FontAwesomeIcon className="breadcrumb-icon" icon={faChevronRight} />

          <Typography
            className="breadcrumb-link breadcrumb-link--parent"
            onClick={backToVehicleInventory}
          >
            {backText}
          </Typography>

          <FontAwesomeIcon className="breadcrumb-icon" icon={faChevronRight} />

          <Typography>
            {addText}
          </Typography>
        </Box>

        <Box className="dashboard-page__info-banner layout-box">
          <InfoBcGovBanner msg={BANNER_MESSAGES.ALL_FIELDS_MANDATORY} />
        </Box>

        <Box className="dashboard-page__form layout-box">
          <Typography variant={"h2"}>
            {detailsText}
          </Typography>

          {isTrailer ? (
            <TrailerForm companyId={companyId} />
          ) : (
            <PowerUnitForm companyId={companyId} />
          )}
        </Box>
      </div>
    );
  },
);

AddVehicleDashboard.displayName = "AddVehicleDashboard";
