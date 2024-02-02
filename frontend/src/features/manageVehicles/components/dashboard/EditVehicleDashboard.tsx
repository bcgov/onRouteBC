import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "./EditVehicleDashboard.scss";
import { Banner } from "../../../../common/components/dashboard/Banner";
import { InfoBcGovBanner } from "../../../../common/components/banners/InfoBcGovBanner";
import { PowerUnitForm } from "../form/PowerUnitForm";
import { TrailerForm } from "../form/TrailerForm";
import { PowerUnit, Trailer, VEHICLE_TYPES, VehicleType } from "../../types/Vehicle";
import { DATE_FORMATS, toLocal } from "../../../../common/helpers/formatDate";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import { ERROR_ROUTES, VEHICLES_ROUTES } from "../../../../routes/constants";
import { useVehicleByIdQuery } from "../../apiManager/hooks";
import { Loading } from "../../../../common/pages/Loading";
import { BANNER_MESSAGES } from "../../../../common/constants/bannerMessages";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../common/helpers/util";

export const EditVehicleDashboard = React.memo(
  ({ editVehicleMode }: { editVehicleMode: VehicleType }) => {
    const navigate = useNavigate();
    const { vehicleId } = useParams();
    const companyId = getDefaultRequiredVal("0", getCompanyIdFromSession());

    const isEditPowerUnit = (editVehicleMode: VehicleType) =>
      editVehicleMode === VEHICLE_TYPES.POWER_UNIT;
    const isEditTrailer = (editVehicleMode: VehicleType) =>
      editVehicleMode === VEHICLE_TYPES.TRAILER;

    const { data: vehicleToEdit } = useVehicleByIdQuery(
      companyId,
      isEditPowerUnit(editVehicleMode) ? VEHICLE_TYPES.POWER_UNIT : VEHICLE_TYPES.TRAILER,
      vehicleId,
    );

    const backToVehicleInventory = () => {
      if (editVehicleMode === VEHICLE_TYPES.TRAILER) {
        navigate(VEHICLES_ROUTES.TRAILER_TAB);
      } else {
        navigate(VEHICLES_ROUTES.MANAGE);
      }
    };

    if (typeof vehicleToEdit === "undefined") {
      return <Loading />;
    }

    if (!vehicleToEdit) {
      return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
    }

    return (
      <div className="dashboard-page">
        <Box className="dashboard-page__banner layout-box">
          {(isEditPowerUnit(editVehicleMode) ||
            isEditTrailer(editVehicleMode)) && (
            <Banner
              bannerText={`Edit ${
                isEditPowerUnit(editVehicleMode) ? "Power Unit" : "Trailer"
              }`}
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
            {editVehicleMode === VEHICLE_TYPES.POWER_UNIT && "Power Unit"}
            {editVehicleMode === VEHICLE_TYPES.TRAILER && "Trailer"}
          </Typography>

          <FontAwesomeIcon className="breadcrumb-icon" icon={faChevronRight} />

          <Typography>
            {editVehicleMode === VEHICLE_TYPES.POWER_UNIT &&
              "Edit Power Unit"}
            {editVehicleMode === VEHICLE_TYPES.TRAILER && "Edit Trailer"}
          </Typography>
        </Box>

        <Box className="dashboard-page__info-banner layout-box">
          <InfoBcGovBanner msg={BANNER_MESSAGES.ALL_FIELDS_MANDATORY} />
        </Box>

        <Box className="dashboard-page__form layout-box">
          <Typography variant={"h2"}>
            {editVehicleMode === VEHICLE_TYPES.POWER_UNIT &&
              "Power Unit Details"}
            {editVehicleMode === VEHICLE_TYPES.TRAILER &&
              "Trailer Details"}
          </Typography>
          {isEditPowerUnit(editVehicleMode) ? (
            <PowerUnitForm
              powerUnit={vehicleToEdit as PowerUnit}
              companyId={companyId}
            />
          ) : (
            <TrailerForm
              trailer={vehicleToEdit as Trailer}
              companyId={companyId}
            />
          )}
        </Box>
      </div>
    );
  },
);

EditVehicleDashboard.displayName = "EditVehicleDashboard";
