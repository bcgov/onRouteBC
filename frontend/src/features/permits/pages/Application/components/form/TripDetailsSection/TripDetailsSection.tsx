import { Box } from "@mui/material";

import "./TripDetailsSection.scss";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { TripOriginDestination } from "./TripOriginDestination";
import { SpecificRouteDetails } from "./SpecificRouteDetails";
import { HighwaySequences } from "./HighwaySequences";
import { Nullable } from "../../../../../../../common/types/common";

export const TripDetailsSection = ({
  feature,
  permitType,
  highwaySequence,
  onUpdateHighwaySequence,
  onUpdateTripTotalDistance,
}: {
  feature: string;
  permitType: PermitType;
  highwaySequence: string[];
  onUpdateHighwaySequence: (updatedHighwaySequence: string[]) => void;
  onUpdateTripTotalDistance: (updatedTotalDistance?: Nullable<number>) => void;
}) => {
  return (permitType === PERMIT_TYPES.STOS || permitType === PERMIT_TYPES.MFP) ? (
    <Box className="trip-details-section">
      <Box className="trip-details-section__header">
        <h3 className="trip-details-section__title">
          Trip Details
        </h3>
      </Box>

      <Box className="trip-details-section__body">
        <TripOriginDestination
          feature={feature}
        />

        <HighwaySequences
          highwaySequence={highwaySequence}
          onUpdateHighwaySequence={onUpdateHighwaySequence}
        />

        <SpecificRouteDetails feature={feature} />
      </Box>
    </Box>
  ) : null;
};
