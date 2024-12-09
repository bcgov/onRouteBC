import { Box, Typography } from "@mui/material";

import "./ApplicationNotes.scss";
import { Nullable } from "../../../../../../common/types/common";

export const ApplicationNotes = ({
  applicationNotes,
}: {
  applicationNotes?: Nullable<string>;
}) => {
  return applicationNotes ? (
    <Box className="review-application-notes">
      <Box className="review-application-notes__header">
        <Typography variant={"h3"} className="review-application-notes__title">
          Application Notes
        </Typography>
      </Box>

      <Box className="review-application-notes__body">
        <Typography
          className="application-notes-text"
          data-testid="permit-application-notes"
        >
          {applicationNotes}
        </Typography>
      </Box>
    </Box>
  ) : null;
};
