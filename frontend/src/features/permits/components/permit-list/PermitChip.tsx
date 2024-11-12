import "./PermitChip.scss";
import { OnRouteBCChip } from "../../../../common/components/chip/OnRouteBCChip";
import {
  PERMIT_EXPIRED,
  PERMIT_STATUSES,
  isPermitInactive,
} from "../../types/PermitStatus";
import { APPLICATION_QUEUE_STATUSES } from "../../../queue/types/ApplicationQueueStatus";

/**
 * Returns the theme name for the chip based on the permit status.
 * If the permit is inactive or expired, a chip has to be displayed
 * beside the permit number.
 * @param permitStatus string representing the permit status
 * @returns A string representing the theme name for the chip
 */
const getTheme = (permitStatus?: string) => {
  switch (permitStatus) {
    case PERMIT_STATUSES.VOIDED:
      return "voided";
    case PERMIT_STATUSES.REVOKED:
      return "revoked";
    case PERMIT_STATUSES.SUPERSEDED:
      return "superseded";
    case PERMIT_EXPIRED:
      return "expired";
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
const getStatusText = (permitStatus?: string): string => {
  switch (permitStatus) {
    case PERMIT_STATUSES.VOIDED:
      return "Void";
    case PERMIT_STATUSES.REVOKED:
      return "Revoked";
    case PERMIT_STATUSES.SUPERSEDED:
      return "Superseded";
    case PERMIT_EXPIRED:
      return "Expired";
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
 * A boolean indicating if a small badge has to be displayed beside the Permit Number.
 */
const shouldShowPermitChip = (permitStatus?: string) => {
  return isPermitInactive(permitStatus) || permitStatus === PERMIT_EXPIRED;
};

/**
 * A simple chip component to be displayed beside the permit number.
 */
export const PermitChip = ({ permitStatus }: { permitStatus?: string }) => {
  if (!shouldShowPermitChip(permitStatus)) {
    return null;
  }

  const chipTheme = getTheme(permitStatus);
  return chipTheme ? (
    <OnRouteBCChip
      className={`permit-chip permit-chip--${chipTheme}`}
      message={getStatusText(permitStatus)}
    />
  ) : null;
};

PermitChip.displayName = "PermitChip";
