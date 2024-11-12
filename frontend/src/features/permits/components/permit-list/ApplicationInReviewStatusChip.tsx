import "./ApplicationInReviewStatusChip.scss";
import { OnRouteBCChip } from "../../../../common/components/chip/OnRouteBCChip";

import {
  APPLICATION_QUEUE_STATUSES,
  ApplicationQueueStatus,
} from "../../../queue/types/ApplicationQueueStatus";

/**
 * Returns the theme name for the chip based on the permit status.
 * If the permit is inactive or expired, a chip has to be displayed
 * beside the permit number.
 * @param applicationQueueStatus string representing the permit status
 * @returns A string representing the theme name for the chip
 */
const getTheme = (applicationQueueStatus?: ApplicationQueueStatus) => {
  switch (applicationQueueStatus) {
    case APPLICATION_QUEUE_STATUSES.PENDING_REVIEW:
      return "pending-review";
    case APPLICATION_QUEUE_STATUSES.IN_REVIEW:
      return "in-review";
    case APPLICATION_QUEUE_STATUSES.CLOSED:
      return "closed";
    default:
      return undefined;
  }
};

/**
 * Returns the text corresponding to the status of a permit.
 * @param permitStatus string representing the permit status
 * @returns Display text string corresponding to permit status
 */
const getStatusText = (
  applicationQueueStatus?: ApplicationQueueStatus,
): string => {
  switch (applicationQueueStatus) {
    case APPLICATION_QUEUE_STATUSES.PENDING_REVIEW:
      return "Pending Review";
    case APPLICATION_QUEUE_STATUSES.IN_REVIEW:
      return "In Review";
    case APPLICATION_QUEUE_STATUSES.CLOSED:
      return "Closed";
    default:
      return "";
  }
};
/**
 * A simple chip component to be displayed beside the permit number.
 */
export const ApplicationInReviewStatusChip = ({
  applicationQueueStatus,
}: {
  applicationQueueStatus?: ApplicationQueueStatus;
}) => {
  const chipTheme = getTheme(applicationQueueStatus);
  return chipTheme ? (
    <OnRouteBCChip
      className={`permit-chip permit-chip--${chipTheme}`}
      message={getStatusText(applicationQueueStatus)}
    />
  ) : null;
};

ApplicationInReviewStatusChip.displayName = "ApplicationInReviewStatusChip";
