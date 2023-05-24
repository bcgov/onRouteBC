import React from "react";
import { VEHICLE_TYPES_ENUM } from "../form/constants";
import { PowerUnitForm } from "../form/PowerUnitForm";
import { TrailerForm } from "../form/TrailerForm";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "../../../../common/components/dashboard/Dashboard.scss";
import { Banner } from "../../../../common/components/dashboard/Banner";
import { BC_COLOURS } from "../../../../themes/bcGovStyles";
import { InfoBcGovBanner } from "../../../../common/components/banners/AlertBanners";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getVehicleById } from "../../apiManager/vehiclesAPI";
import { PowerUnit, Trailer } from "../../types/managevehicles";

export const EditVehicleDashboard = React.memo(
  ({ editVehicleMode }: { editVehicleMode: VEHICLE_TYPES_ENUM }) => {
    const navigate = useNavigate();
    const { vehicleId } = useParams();

    const { data: vehicleToEdit, isLoading } = useQuery(
      ["vehicleById", vehicleId],
      () =>
        getVehicleById(
          vehicleId as string,
          editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT
            ? "powerUnit"
            : "trailer"
        ),
      { retry: false, enabled: true }
    );

    const handleShowAddVehicle = () => {
      navigate("../");
    };

    /**
     * Formats a given ISO date string into a user-friendly format.
     * @param dateString The date value as a string
     * @returns The formatted date. E.g.: Apr 17, 2023.
     *          Empty string if the date is undefined or null
     */
    const formatDate = (dateString: string | undefined | null): string => {
      if (!dateString) return "";
      return new Intl.DateTimeFormat("default", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(dateString));
    };

    return (
      <>
        <Box
          className="layout-box"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT && (
            <Banner
              bannerText={"Edit Power Unit"}
              // Replace with a grid structure
              bannerSubtext={
                <div>
                  <strong>Date Created:</strong>
                  &nbsp;
                  {formatDate(vehicleToEdit?.createdDateTime)}
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  <strong>Last Updated:</strong>&nbsp;{" "}
                  {formatDate(vehicleToEdit?.createdDateTime)}
                </div>
              }
              extendHeight={true}
            />
          )}
          {editVehicleMode === VEHICLE_TYPES_ENUM.TRAILER && (
            <Banner
              bannerText={"Edit Trailer"}
              // Replace with a grid structure
              bannerSubtext={
                <div>
                  <strong>Date Created:</strong>
                  &nbsp;
                  {formatDate(vehicleToEdit?.createdDateTime)}
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  <strong>Last Updated:</strong>&nbsp;{" "}
                  {formatDate(vehicleToEdit?.createdDateTime)}
                </div>
              }
              extendHeight={true}
            />
          )}
        </Box>
        <Box
          className="layout-box"
          sx={{
            display: "flex",
            height: "60px",
            alignItems: "center",
            backgroundColor: BC_COLOURS.white,
          }}
        >
          <Typography
            onClick={handleShowAddVehicle}
            sx={{
              color: BC_COLOURS.bc_text_links_blue,
              cursor: "pointer",
              marginRight: "8px",
              textDecoration: "underline",
            }}
          >
            Vehicle Inventory
          </Typography>
          <FontAwesomeIcon
            icon={faChevronRight}
            style={{ marginLeft: "8px", marginRight: "8px" }}
          />
          <Typography
            onClick={handleShowAddVehicle}
            style={{
              color: BC_COLOURS.bc_text_links_blue,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT && "Power Unit"}
            {editVehicleMode === VEHICLE_TYPES_ENUM.TRAILER && "Trailer"}
          </Typography>
          <FontAwesomeIcon
            icon={faChevronRight}
            style={{ marginLeft: "8px", marginRight: "8px" }}
          />
          <Typography>
            {editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT &&
              "Edit Power Unit"}
            {editVehicleMode === VEHICLE_TYPES_ENUM.TRAILER && "Edit Trailer"}
          </Typography>
        </Box>

        <Box
          className="layout-box"
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: BC_COLOURS.white,
          }}
        >
          <InfoBcGovBanner
            width="880px"
            description="Please note, unless stated otherwise, all fields are mandatory."
          />
        </Box>

        <Box
          className="layout-box"
          sx={{
            display: "flex",
            paddingTop: "24px",
            backgroundColor: BC_COLOURS.white,
          }}
        >
          <Typography
            variant={"h2"}
            sx={{
              marginRight: "200px",
              marginTop: "0px",
              paddingTop: "0px",
            }}
          >
            {editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT &&
              "Power Unit Details"}
            {editVehicleMode === VEHICLE_TYPES_ENUM.TRAILER &&
              "Trailer Details"}
          </Typography>
          {!isLoading && editVehicleMode === VEHICLE_TYPES_ENUM.POWER_UNIT && (
            <PowerUnitForm powerUnit={vehicleToEdit as PowerUnit} />
          )}
          {!isLoading && editVehicleMode === VEHICLE_TYPES_ENUM.TRAILER && (
            <TrailerForm trailer={vehicleToEdit as Trailer} />
          )}
        </Box>
      </>
    );
  }
);

EditVehicleDashboard.displayName = "EditVehicleDashboard";
