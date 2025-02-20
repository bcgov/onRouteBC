import { Box, Typography } from "@mui/material";

import "./ThirdPartyLiabilitySection.scss";
import { Nullable } from "../../../../../../common/types/common";
import { ThirdPartyLiability, thirdPartyLiabilityFullName } from "../../../../types/ThirdPartyLiability";
import { DiffChip } from "./DiffChip";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";

export const ThirdPartyLiabilitySection = ({
  thirdPartyLiability,
  oldThirdPartyLiability,
  showChangedFields = false,
}: {
  thirdPartyLiability?: Nullable<ThirdPartyLiability>;
  oldThirdPartyLiability?: Nullable<ThirdPartyLiability>;
  showChangedFields?: boolean;
}) => {
  const changedFields = showChangedFields
    ? {
        thirdPartyLiability: areValuesDifferent(
          thirdPartyLiability,
          oldThirdPartyLiability,
        ),
      }
    : {
        thirdPartyLiability: false,
      };

  const showDiffChip = (show: boolean) => {
    return show ? <DiffChip /> : null;
  };

  return thirdPartyLiability ? (
    <Box className="third-party-liability-section">
      <Box className="third-party-liability-section__header">
        <Typography variant={"h3"} className="third-party-liability-section__title">
          Third Party Liability
        </Typography>
      </Box>

      <Box className="third-party-liability-section__body">
        <Typography
          className="third-party-liability-text"
          data-testid="permit-third-party-liability"
        >
          {thirdPartyLiabilityFullName(thirdPartyLiability)}
        </Typography>

        {showDiffChip(changedFields.thirdPartyLiability)}
      </Box>
    </Box>
  ) : null;
};
