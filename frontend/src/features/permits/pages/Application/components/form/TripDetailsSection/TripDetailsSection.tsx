import { Box } from "@mui/material";

import "./TripDetailsSection.scss";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { TripOriginDestination } from "./TripOriginDestination";
import { SpecificRouteDetails } from "./SpecificRouteDetails";
import { HighwaySequences } from "./HighwaySequences";
import { Nullable, RequiredOrNull } from "../../../../../../../common/types/common";

export const TripDetailsSection = ({
  feature,
  permitType,
  highwaySequence,
  tripOrigin,
  tripDestination,
  totalDistance,
  onUpdateHighwaySequence,
  onUpdateTripOrigin,
  onUpdateTripDestination,
  onUpdateTotalDistance,
}: {
  feature: string;
  permitType: PermitType;
  highwaySequence: string[];
  tripOrigin?: Nullable<string>;
  tripDestination?: Nullable<string>;
  totalDistance?: Nullable<number>;
  onUpdateHighwaySequence: (updatedHighwaySequence: string[]) => void;
  onUpdateTripOrigin: (updateTripOrigin: string) => void;
  onUpdateTripDestination: (updateTripDestination: string) => void;
  onUpdateTotalDistance: (updatedTotalDistance?: RequiredOrNull<number>) => void;
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
          permitType={permitType}
          tripOrigin={tripOrigin}
          tripDestination={tripDestination}
          totalDistance={totalDistance}
          onUpdateTripOrigin={onUpdateTripOrigin}
          onUpdateTripDestination={onUpdateTripDestination}
          onUpdateTotalDistance={onUpdateTotalDistance}
        />

        {permitType === PERMIT_TYPES.STOS ? (
          <HighwaySequences
            highwaySequence={highwaySequence}
            onUpdateHighwaySequence={onUpdateHighwaySequence}
          />
        ) : null}

        <SpecificRouteDetails feature={feature} />
      </Box>
    </Box>
  ) : null;
};
