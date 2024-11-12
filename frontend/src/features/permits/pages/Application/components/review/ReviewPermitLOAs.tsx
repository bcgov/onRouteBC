import { Box, Typography } from "@mui/material";

import "./ReviewPermitLOAs.scss";
import { LOATable } from "../form/LOATable";
import { Nullable } from "../../../../../../common/types/common";
import { PermitLOA } from "../../../../types/PermitLOA";

export const ReviewPermitLOAs = ({
  loas,
}: {
  loas?: Nullable<PermitLOA[]>;
}) => {
  return loas && loas.length > 0 ? (
    <Box className="review-permit-loas">
      <Box className="review-permit-loas__header">
        <Typography variant="h3" className="review-permit-loas__title">
          Letter of Authorization (LOA)
        </Typography>
      </Box>

      <Box className="review-permit-loas__body">
        <Box className="permit-loas">
          <Typography variant="h3" className="permit-loas__label">
            Selected LOA(s)
          </Typography>

          <LOATable
            loas={loas.map(loa => ({
              loa,
              checked: true,
              disabled: true,
            }))}
          />
        </Box>
      </Box>
    </Box>
  ) : null;
};
