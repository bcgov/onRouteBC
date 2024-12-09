import { Box, Typography } from "@mui/material";

import "./TripDetails.scss";
import { Nullable } from "../../../../../../common/types/common";
import { DiffChip } from "./DiffChip";
import { PermittedRoute } from "../../../../types/PermittedRoute";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { areOrderedSequencesEqual, areValuesDifferent } from "../../../../../../common/helpers/equality";

export const TripDetails = ({
  routeDetails,
  oldRouteDetails,
  showChangedFields = false,
}: {
  routeDetails?: Nullable<PermittedRoute>;
  oldRouteDetails?: Nullable<PermittedRoute>;
  showChangedFields?: boolean;
}) => {
  const origin = getDefaultRequiredVal("", routeDetails?.manualRoute?.origin);
  const destination = getDefaultRequiredVal("", routeDetails?.manualRoute?.destination);
  const highwaySequence = getDefaultRequiredVal([], routeDetails?.manualRoute?.highwaySequence);
  const details = getDefaultRequiredVal("", routeDetails?.routeDetails);

  const changedFields = showChangedFields
    ? {
        origin: areValuesDifferent(
          routeDetails?.manualRoute?.origin,
          oldRouteDetails?.manualRoute?.origin,
        ),
        destination: areValuesDifferent(
          routeDetails?.manualRoute?.destination,
          oldRouteDetails?.manualRoute?.destination,
        ),
        highwaySequences: areOrderedSequencesEqual(
          routeDetails?.manualRoute?.highwaySequence,
          oldRouteDetails?.manualRoute?.highwaySequence,
          (seqNum, oldSeqNum) => seqNum === oldSeqNum,
        ),
        routeDetails: areValuesDifferent(
          routeDetails?.routeDetails,
          oldRouteDetails?.routeDetails,
        ),
      }
    : {
        origin: false,
        destination: false,
        highwaySequences: false,
        routeDetails: false,
      };

  const showDiffChip = (show: boolean) => {
    return show ? <DiffChip /> : null;
  };

  return routeDetails ? (
    <Box className="review-trip-details">
      <Box className="review-trip-details__header">
        <Typography variant={"h3"} className="review-trip-details__title">
          Trip Details
        </Typography>
      </Box>

      <Box className="review-trip-details__body">
        {origin || destination ? (
          <Box className="origin-destination">
            {origin ? (
              <div className="origin-destination__origin">
                <Typography className="origin-destination__label">
                  <span className="origin-destination__label-text">Origin</span>

                  {showDiffChip(changedFields.origin)}
                </Typography>

                <Typography
                  className="origin-destination__data"
                  data-testid="permit-route-origin"
                >
                  {origin}
                </Typography>
              </div>
            ) : null}
            
            {destination ? (
              <div className="origin-destination__destination">
                <Typography className="origin-destination__label">
                  <span className="origin-destination__label-text">Destination</span>

                  {showDiffChip(changedFields.destination)}
                </Typography>

                <Typography
                  className="origin-destination__data"
                  data-testid="permit-route-destination"
                >
                  {destination}
                </Typography>
              </div>
            ) : null}
          </Box>
        ) : null}

        {highwaySequence.length > 0 ? (
          <Box className="review-highway-sequences">
            <div className="review-highway-sequences__header">
              <Typography variant="h4">
                Sequences of highways to be travelled
              </Typography>
              
              {showDiffChip(changedFields.highwaySequences)}
            </div>
            
            <div className="review-highway-sequences__sequences">
              {highwaySequence.map((highwaySequence, index) => (
                <Typography
                  key={`${highwaySequence}-${index}`}
                  className="review-highway-sequences__sequence"
                >
                  {highwaySequence}
                </Typography>
              ))}
            </div>
          </Box>
        ) : null}

        {details ? (
          <Box className="specific-route">
            <Typography className="specific-route__label">
              <span className="specific-route__label-text">
                Specific Route Details
              </span>

              {showDiffChip(changedFields.routeDetails)}
            </Typography>

            <Typography
              className="specific-route__data"
              data-testid="permit-specific-route-details"
            >
              {details}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  ) : null;
};
