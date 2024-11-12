import { Box, Typography } from "@mui/material";

import "./ReviewFeeSummary.scss";
import { ConfirmationCheckboxes } from "./ConfirmationCheckboxes";
import { FeeSummary } from "../../../../components/feeSummary/FeeSummary";
import { PermitType } from "../../../../types/PermitType";
import { Nullable } from "../../../../../../common/types/common";
import {
  PERMIT_REVIEW_CONTEXTS,
  PermitReviewContext,
} from "../../../../types/PermitReviewContext";

export const ReviewFeeSummary = ({
  hasAttemptedSubmission,
  areAllConfirmed,
  setAreAllConfirmed,
  permitType,
  fee,
  reviewContext,
}: {
  hasAttemptedSubmission: boolean;
  areAllConfirmed: boolean;
  setAreAllConfirmed: (allConfirmed: boolean) => void;
  permitType?: Nullable<PermitType>;
  fee: string;
  reviewContext: PermitReviewContext;
}) => {
  return (
    <Box className="review-fee-summary">
      <Box className="review-fee-summary__header">
        <Typography variant={"h3"}></Typography>
      </Box>
      <Box className="review-fee-summary__body">
        <Box className="fee-summary-wrapper">
          <FeeSummary permitType={permitType} feeSummary={fee} />

          <ConfirmationCheckboxes
            hasAttemptedSubmission={hasAttemptedSubmission}
            areAllChecked={areAllConfirmed}
            setAreAllChecked={setAreAllConfirmed}
            shouldDisableCheckboxes={
              reviewContext === PERMIT_REVIEW_CONTEXTS.QUEUE
            }
          />
        </Box>
      </Box>
    </Box>
  );
};
