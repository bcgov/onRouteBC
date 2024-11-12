import { Box, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { ErrorBcGovBanner } from "../../../../../../common/components/banners/ErrorBcGovBanner";
import { PermitExpiryDateBanner } from "../../../../../../common/components/banners/PermitExpiryDateBanner";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";
import {
  DATE_FORMATS,
  dayjsToLocalStr,
} from "../../../../../../common/helpers/formatDate";
import { applyWhenNotNullable } from "../../../../../../common/helpers/util";
import { Nullable } from "../../../../../../common/types/common";
import { BASE_DAYS_IN_YEAR } from "../../../../constants/constants";
import { PermitCondition } from "../../../../types/PermitCondition";
import { DiffChip } from "./DiffChip";
import { ReviewConditionsTable } from "./ReviewConditionsTable";
import "./ReviewPermitDetails.scss";
import { pastStartOrExpiryDate } from "../../../../../../common/helpers/validationMessages";

export const ReviewPermitDetails = ({
  startDate,
  permitDuration,
  expiryDate,
  conditions,
  showChangedFields = false,
  oldStartDate,
  oldDuration,
  showDateErrorBanner,
}: {
  startDate?: Nullable<Dayjs>;
  permitDuration?: Nullable<number>;
  expiryDate?: Nullable<Dayjs>;
  conditions?: Nullable<PermitCondition[]>;
  showChangedFields?: boolean;
  oldStartDate?: Nullable<Dayjs>;
  oldDuration?: Nullable<number>;
  showDateErrorBanner?: Nullable<boolean>;
}) => {
  const changedFields = showChangedFields
    ? {
        startDate:
          applyWhenNotNullable(
            (dayJsObject) =>
              dayjsToLocalStr(dayJsObject, DATE_FORMATS.DATEONLY_SLASH),
            startDate,
            "",
          ) !==
          applyWhenNotNullable(
            (dayJsObject) =>
              dayjsToLocalStr(dayJsObject, DATE_FORMATS.DATEONLY_SLASH),
            oldStartDate,
            "",
          ),
        duration: areValuesDifferent(permitDuration, oldDuration),
      }
    : {
        startDate: false,
        duration: false,
      };

  return (
    <Box className="review-permit-details">
      <Box className="review-permit-details__header">
        <Typography variant={"h3"} className="review-permit-details__title">
          Permit Details
        </Typography>
      </Box>
      <Box className="review-permit-details__body">
        <Box className="permit-dates">
          <Typography className="permit-dates__label">
            <span className="permit-dates__label-text">Start Date</span>
            {changedFields.startDate ? <DiffChip /> : null}
          </Typography>
          <Typography
            className="permit-dates__data"
            data-testid="permit-start-date"
          >
            {applyWhenNotNullable(
              (dayJsObject) =>
                dayjsToLocalStr(dayJsObject, DATE_FORMATS.DATEONLY_SLASH),
              startDate,
              "",
            )}
          </Typography>
          <Typography className="permit-dates__label">
            <span className="permit-dates__label-text">Permit Duration</span>
            {changedFields.duration ? <DiffChip /> : null}
          </Typography>
          <Typography
            className="permit-dates__data"
            data-testid="permit-duration"
          >
            {applyWhenNotNullable(
              (duration) =>
                duration === BASE_DAYS_IN_YEAR ? "1 Year" : `${duration} Days`,
              permitDuration,
              "",
            )}
          </Typography>
        </Box>
        <Box className="permit-expiry-banner">
          <PermitExpiryDateBanner
            expiryDate={applyWhenNotNullable(
              (dayJsObject) => dayjsToLocalStr(dayJsObject, DATE_FORMATS.SHORT),
              expiryDate,
              "",
            )}
          />
        </Box>

        {showDateErrorBanner && (
          <Box className="permit-error-banner">
            <ErrorBcGovBanner msg={pastStartOrExpiryDate()} />
          </Box>
        )}
        <Box className="permit-conditions">
          <Typography variant="h3">
            Selected commodities and their respective CVSE forms.
          </Typography>
          <ReviewConditionsTable conditions={conditions} />
        </Box>
      </Box>
    </Box>
  );
};
