import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "./AddVehicleDashboard.scss";
import { Banner } from "../../../../common/components/dashboard/Banner";
import { InfoBcGovBanner } from "../../../../common/components/banners/InfoBcGovBanner";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { PowerUnitForm } from "../form/PowerUnitForm";
import { TrailerForm } from "../form/TrailerForm";
import { VEHICLES_ROUTES, withCompanyId } from "../../../../routes/constants";
import { BANNER_MESSAGES } from "../../../../common/constants/bannerMessages";
import { VEHICLE_TYPES, VehicleType } from "../../types/Vehicle";

export const AddVehicleDashboard = React.memo(
  ({ addVehicleMode }: { addVehicleMode: VehicleType }) => {
    const navigate = useNavigate();

    const backToVehicleInventory = () => {
      if (addVehicleMode === VEHICLE_TYPES.TRAILER) {
        navigate(withCompanyId(VEHICLES_ROUTES.TRAILER_TAB));
      } else {
        navigate(withCompanyId(VEHICLES_ROUTES.MANAGE));
      }
    };

    const companyId = getDefaultRequiredVal("0", getCompanyIdFromSession());

    return (
      <div className="dashboard-page">
        <Box className="dashboard-page__banner layout-box">
          {addVehicleMode === VEHICLE_TYPES.POWER_UNIT && (
            <Banner bannerText="Add Power Unit" />
          )}
          {addVehicleMode === VEHICLE_TYPES.TRAILER && (
            <Banner bannerText="Add Trailer" />
          )}
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
            {addVehicleMode === VEHICLE_TYPES.POWER_UNIT && "Power Unit"}
            {addVehicleMode === VEHICLE_TYPES.TRAILER && "Trailer"}
          </Typography>

          <FontAwesomeIcon className="breadcrumb-icon" icon={faChevronRight} />

          <Typography>
            {addVehicleMode === VEHICLE_TYPES.POWER_UNIT && "Add Power Unit"}
            {addVehicleMode === VEHICLE_TYPES.TRAILER && "Add Trailer"}
          </Typography>
        </Box>

        <Box className="dashboard-page__info-banner layout-box">
          <InfoBcGovBanner msg={BANNER_MESSAGES.ALL_FIELDS_MANDATORY} />
        </Box>

        <Box className="dashboard-page__form layout-box">
          <Typography variant={"h2"}>
            {addVehicleMode === VEHICLE_TYPES.POWER_UNIT &&
              "Power Unit Details"}
            {addVehicleMode === VEHICLE_TYPES.TRAILER && "Trailer Details"}
          </Typography>
          {addVehicleMode === VEHICLE_TYPES.POWER_UNIT && (
            <PowerUnitForm companyId={companyId} />
          )}
          {addVehicleMode === VEHICLE_TYPES.TRAILER && (
            <TrailerForm companyId={companyId} />
          )}
        </Box>
      </div>
    );
  },
);

AddVehicleDashboard.displayName = "AddVehicleDashboard";
