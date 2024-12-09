import { Box, Typography } from "@mui/material";

import "./LoadedDimensions.scss";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";
import { Nullable } from "../../../../../../common/types/common";
import { DiffChip } from "./DiffChip";
import { PermitVehicleConfiguration } from "../../../../types/PermitVehicleConfiguration";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";

export const LoadedDimensions = ({
  vehicleConfiguration,
  oldVehicleConfiguration,
  showChangedFields = false,
}: {
  vehicleConfiguration?: Nullable<PermitVehicleConfiguration>;
  oldVehicleConfiguration?: Nullable<PermitVehicleConfiguration>;
  showChangedFields?: boolean;
}) => {
  const changedFields = showChangedFields
    ? {
        overallWidth: areValuesDifferent(
          vehicleConfiguration?.overallWidth,
          oldVehicleConfiguration?.overallWidth,
        ),
        overallHeight: areValuesDifferent(
          vehicleConfiguration?.overallHeight,
          oldVehicleConfiguration?.overallHeight,
        ),
        overallLength: areValuesDifferent(
          vehicleConfiguration?.overallLength,
          oldVehicleConfiguration?.overallLength,
        ),
        frontProjection: areValuesDifferent(
          vehicleConfiguration?.frontProjection,
          oldVehicleConfiguration?.frontProjection,
        ),
        rearProjection: areValuesDifferent(
          vehicleConfiguration?.rearProjection,
          oldVehicleConfiguration?.rearProjection,
        ),
      }
    : {
        overallWidth: false,
        overallHeight: false,
        overallLength: false,
        frontProjection: false,
        rearProjection: false,
      };

  return vehicleConfiguration ? (
    <Box className="review-loaded-dimensions">
      <Box className="review-loaded-dimensions__header">
        <Typography variant={"h3"} className="review-loaded-dimensions__title">
          Loaded Dimensions (Metres)
        </Typography>
      </Box>

      <Box className="review-loaded-dimensions__body">
        <div className="loaded-dimension loaded-dimension--overall-width">
          <Typography className="loaded-dimension__label">
            <span className="loaded-dimension__label-text">Overall Width</span>

            {changedFields.overallWidth ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="loaded-dimension__data"
            data-testid="permit-overall-width"
          >
            {getDefaultRequiredVal(0, vehicleConfiguration?.overallWidth).toFixed(2)}
          </Typography>
        </div>

        <div className="loaded-dimension loaded-dimension--overall-height">
          <Typography className="loaded-dimension__label">
            <span className="loaded-dimension__label-text">Overall Height</span>

            {changedFields.overallHeight ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="loaded-dimension__data"
            data-testid="permit-overall-height"
          >
            {getDefaultRequiredVal(0, vehicleConfiguration?.overallHeight).toFixed(2)}
          </Typography>
        </div>

        <div className="loaded-dimension loaded-dimension--overall-length">
          <Typography className="loaded-dimension__label">
            <span className="loaded-dimension__label-text">Overall Length</span>

            {changedFields.overallLength ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="loaded-dimension__data"
            data-testid="permit-overall-length"
          >
            {getDefaultRequiredVal(0, vehicleConfiguration?.overallLength).toFixed(2)}
          </Typography>
        </div>

        <div className="loaded-dimension loaded-dimension--front-projection">
          <Typography className="loaded-dimension__label">
            <span className="loaded-dimension__label-text">Front Projection</span>

            {changedFields.frontProjection ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="loaded-dimension__data"
            data-testid="permit-front-projection"
          >
            {getDefaultRequiredVal(0, vehicleConfiguration?.frontProjection).toFixed(2)}
          </Typography>
        </div>

        <div className="loaded-dimension loaded-dimension--rear-projection">
          <Typography className="loaded-dimension__label">
            <span className="loaded-dimension__label-text">Rear Projection</span>

            {changedFields.rearProjection ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="loaded-dimension__data"
            data-testid="permit-rear-projection"
          >
            {getDefaultRequiredVal(0, vehicleConfiguration?.rearProjection).toFixed(2)}
          </Typography>
        </div>
      </Box>
    </Box>
  ) : null;
};
