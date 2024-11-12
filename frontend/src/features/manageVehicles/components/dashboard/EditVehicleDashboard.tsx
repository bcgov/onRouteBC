import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "./EditVehicleDashboard.scss";
import { Banner } from "../../../../common/components/dashboard/components/banner/Banner";
import { InfoBcGovBanner } from "../../../../common/components/banners/InfoBcGovBanner";
import { PowerUnitForm } from "../form/PowerUnitForm";
import { TrailerForm } from "../form/TrailerForm";
import { DATE_FORMATS, toLocal } from "../../../../common/helpers/formatDate";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { ERROR_ROUTES, VEHICLES_ROUTES } from "../../../../routes/constants";
import { useVehicleByIdQuery } from "../../hooks/vehicles";
import { Loading } from "../../../../common/pages/Loading";
import { BANNER_MESSAGES } from "../../../../common/constants/bannerMessages";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../common/helpers/util";

import {
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
  VehicleType,
} from "../../types/Vehicle";

export const EditVehicleDashboard = React.memo(
  ({ vehicleType }: { vehicleType: VehicleType }) => {
    const navigate = useNavigate();
    const { vehicleId } = useParams();
    const companyId: number = applyWhenNotNullable(id => Number(id), getCompanyIdFromSession(), 0);
    const isTrailer = vehicleType === VEHICLE_TYPES.TRAILER;

    const { data: vehicleToEdit, isError } = useVehicleByIdQuery(
      companyId,
      vehicleType,
      vehicleId,
    );

    const backToVehicleInventory = () => {
      if (vehicleType === VEHICLE_TYPES.TRAILER) {
        navigate(VEHICLES_ROUTES.TRAILER_TAB);
      } else {
        navigate(VEHICLES_ROUTES.MANAGE);
      }
    };

    if (isError) {
      return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
    }

    if (typeof vehicleToEdit === "undefined") {
      return <Loading />;
    }

    const editText = isTrailer
      ? "Edit Trailer" : "Edit Power Unit";
    const backText = isTrailer
      ? "Trailer" : "Power Unit";
    const detailsText = isTrailer
      ? "Trailer Details" : "Power Unit Details";

    return (
      <div className="dashboard-page">
        <Box className="dashboard-page__banner layout-box">
          <Banner
            bannerText={editText}
            // Replace with a grid structure
            bannerSubtext={
              <div>
                <strong>Date Created:</strong>
                &nbsp;
                {applyWhenNotNullable(
                  (dateTimeStr: string) =>
                    toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                  vehicleToEdit?.createdDateTime,
                  "",
                )}
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                <strong>Last Updated:</strong>&nbsp;{" "}
                {getDefaultRequiredVal(
                  "",
                  applyWhenNotNullable(
                    (dateTimeStr: string) =>
                      toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                    vehicleToEdit?.updatedDateTime,
                  ),
                  applyWhenNotNullable(
                    (dateTimeStr: string) =>
                      toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                    vehicleToEdit?.createdDateTime,
                    "",
                  ),
                )}
              </div>
            }
          />
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
            {editText}
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
            <TrailerForm
              companyId={companyId}
              trailer={vehicleToEdit as Trailer}
            />
          ) : (
            <PowerUnitForm
              companyId={companyId}
              powerUnit={vehicleToEdit as PowerUnit}
            />
          )}
        </Box>
      </div>
    );
  },
);

EditVehicleDashboard.displayName = "EditVehicleDashboard";
