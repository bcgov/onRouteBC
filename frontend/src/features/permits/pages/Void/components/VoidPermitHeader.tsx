import { Box, Typography } from "@mui/material";

import "./VoidPermitHeader.scss";
import { Permit } from "../../../types/permit";
import { CompanyBanner } from "../../../../../common/components/banners/CompanyBanner";
import { getPermitTypeName } from "../../../types/PermitType";
import { Nullable } from "../../../../../common/types/common";
import {
  DATE_FORMATS,
  toLocal,
} from "../../../../../common/helpers/formatDate";

export const VoidPermitHeader = ({ permit }: { permit: Nullable<Permit> }) => {
  return permit ? (
    <div className="void-permit__header">
      <Typography
        className="header-title"
        data-testid="void-permit-title"
        variant="h1"
      >
        {getPermitTypeName(permit.permitType)}
      </Typography>

      <Box className="permit-number">
        <Box component="span" className="permit-number__label">
          Voiding/Revoking Permit #:
        </Box>
        <Box
          component="span"
          className="permit-number__value"
          data-testid="void-permit-number"
        >
          {permit.permitNumber}
        </Box>
      </Box>

      <Box className="permit-info">
        <Box className="permit-info--start">
          <Box component="span" className="permit-info__label">
            Permit Start Date:
          </Box>
          <Box
            component="span"
            className="permit-info__value"
            data-testid="void-permit-start-date"
          >
            {toLocal(
              permit.permitData.startDate,
              DATE_FORMATS.DATEONLY_ABBR_MONTH,
              true,
            )}
          </Box>
        </Box>
        <Box className="permit-info--end">
          <Box component="span" className="permit-info__label">
            Permit End Date:
          </Box>
          <Box
            component="span"
            className="permit-info__value"
            data-testid="void-permit-end-date"
          >
            {toLocal(
              permit.permitData.expiryDate,
              DATE_FORMATS.DATEONLY_ABBR_MONTH,
              true,
            )}
          </Box>
        </Box>
        {permit.permitData.vehicleDetails?.plate ? (
          <Box className="permit-info--plate">
            <Box component="span" className="permit-info__label">
              Plate #:
            </Box>
            <Box
              component="span"
              className="permit-info__value"
              data-testid="void-permit-plate"
            >
              {permit.permitData.vehicleDetails.plate}
            </Box>
          </Box>
        ) : null}
      </Box>

      {permit.permitData.clientNumber && permit.permitData.companyName ? (
        <CompanyBanner
          companyName={permit.permitData.companyName}
          clientNumber={permit.permitData.clientNumber}
        />
      ) : null}
    </div>
  ) : null;
};
