import { Box, Typography } from "@mui/material";
import { Dayjs } from "dayjs";

import { CompanyBanner } from "../../../../common/components/banners/CompanyBanner";
import { CompanyInformation } from "./CompanyInformation";
import "./ApplicationDetails.scss";
import { getPermitTypeName } from "../../types/PermitType";
import { CompanyProfile } from "../../../manageProfile/types/manageProfile";
import { Nullable } from "../../../../common/types/common";
import {
  DATE_FORMATS,
  dayjsToLocalStr,
} from "../../../../common/helpers/formatDate";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../common/helpers/util";

export const ApplicationDetails = ({
  permitType,
  infoNumberType = "application",
  infoNumber,
  createdDateTime,
  updatedDateTime,
  companyInfo,
  isAmendAction = false,
  doingBusinessAs,
}: {
  permitType?: Nullable<string>;
  infoNumberType?: Nullable<"application" | "permit">;
  infoNumber?: Nullable<string>;
  createdDateTime?: Nullable<Dayjs>;
  updatedDateTime?: Nullable<Dayjs>;
  companyInfo?: Nullable<CompanyProfile>;
  isAmendAction?: Nullable<boolean>;
  doingBusinessAs?: Nullable<string>;
}) => {
  const applicationName = getPermitTypeName(
    getDefaultRequiredVal("", permitType),
  );

  const validInfoNumber = () => infoNumber && infoNumber !== "";
  const isPermitNumber = () => infoNumberType === "permit";
  const labelText = `${isAmendAction ? "Amending " : ""}${
    isPermitNumber() ? "Permit #:" : "Application #:"
  }`;

  return (
    <>
      <div className="application-details">
        <Typography
          className="application-details__title"
          variant={"h1"}
          data-testid="application-title"
        >
          {applicationName}
        </Typography>
        {validInfoNumber() ? (
          <Box>
            <Typography className="application-number" variant="h2">
              <Box className="application-number__label" component="span">
                {labelText}
              </Box>
              <Box
                className="application-number__number"
                component="span"
                data-testid="application-number"
              >
                {infoNumber}
              </Box>
            </Typography>
            <Box className="application-details__audit-dates">
              <Typography className="audit-date audit-date--created">
                <Box className="audit-date__label" component="span">
                  Date Created:
                </Box>
                <Box
                  className="audit-date__date"
                  component="span"
                  data-testid="application-created-date"
                >
                  {applyWhenNotNullable(
                    (dayjsObj) => dayjsToLocalStr(dayjsObj, DATE_FORMATS.LONG),
                    createdDateTime,
                    "",
                  )}
                </Box>
              </Typography>
              <Typography className="audit-date audit-date--updated">
                <Box className="audit-date__label" component="span">
                  Last Updated:
                </Box>
                <Box
                  className="audit-date__date"
                  component="span"
                  data-testid="application-updated-date"
                >
                  {applyWhenNotNullable(
                    (dayjsObj) => dayjsToLocalStr(dayjsObj, DATE_FORMATS.LONG),
                    updatedDateTime,
                    "",
                  )}
                </Box>
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box></Box>
        )}
      </div>

      <CompanyBanner
        companyName={companyInfo?.legalName}
        clientNumber={companyInfo?.clientNumber}
      />

      <CompanyInformation
        companyInfo={companyInfo}
        doingBusinessAs={doingBusinessAs}
      />
    </>
  );
};
