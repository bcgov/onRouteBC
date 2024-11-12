import { Box, Typography } from "@mui/material";

import "./ApplicationSummary.scss";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { Nullable } from "../../../../../../common/types/common";
import { getPermitTypeName, PermitType } from "../../../../types/PermitType";

export const ApplicationSummary = ({
  permitType,
  applicationNumber,
}: {
  permitType?: Nullable<PermitType>;
  applicationNumber?: Nullable<string>;
}) => {
  const applicationName = getPermitTypeName(
    getDefaultRequiredVal("", permitType),
  );

  const applicationNumberExists = Boolean(applicationNumber);

  return (
    <Box className="application-summary">
      <Typography variant={"h1"}>{applicationName}</Typography>
      {applicationNumberExists ? (
        <Typography variant="h2">Application # {applicationNumber}</Typography>
      ) : (
        <></>
      )}
    </Box>
  );
};
