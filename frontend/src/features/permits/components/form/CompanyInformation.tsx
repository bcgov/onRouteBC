import { Box, Typography } from "@mui/material";

import "./CompanyInformation.scss";
import { CompanyProfile } from "../../../manageProfile/types/manageProfile";
import { Nullable } from "../../../../common/types/common";
import { getProvinceFullName } from "../../../../common/helpers/countries/getProvinceFullName";
import { getCountryFullName } from "../../../../common/helpers/countries/getCountryFullName";

export const CompanyInformation = ({
  companyInfo,
  doingBusinessAs,
}: {
  companyInfo?: Nullable<CompanyProfile>;
  doingBusinessAs?: Nullable<string>;
}) => {
  const countryFullName = getCountryFullName(companyInfo?.mailingAddress?.countryCode);
  const provinceFullName = getProvinceFullName(
    companyInfo?.mailingAddress?.countryCode,
    companyInfo?.mailingAddress?.provinceCode,
  );

  return (
    <Box className="company-info">
      <Box className="company-info__header">
        <h3 data-testid="company-info-header-title">
          Company Information
        </h3>
        
        <Typography
          className="company-info__info-msg"
          data-testid="company-info-header-desc"
        >
          If the Company Mailing Address is incorrect, please contact your
          onRouteBC Administrator.
        </Typography>
      </Box>

      <Box className="company-info__body">
        {doingBusinessAs ? (
          <Box className="company-info__doing-business">
            <h4 data-testid="doing-business-as-title">
              Doing Business As
            </h4>

            <Box>
              <Typography data-testid="doing-business-as">
                {doingBusinessAs}
              </Typography>
            </Box>
          </Box>
        ) : null}

        {companyInfo?.mailingAddress ? (
          <Box className="company-info__mailing-addr">
            <h4 data-testid="company-mail-addr-title">
              Company Mailing Address
            </h4>

            <Box>
              <Typography data-testid="company-mail-addr-line1">
                {companyInfo.mailingAddress.addressLine1}
              </Typography>

              {countryFullName ? (
                <Typography data-testid="company-mail-addr-country">
                  {countryFullName}
                </Typography>
              ) : null}

              {provinceFullName ? (
                <Typography data-testid="company-mail-addr-prov">
                  {provinceFullName}
                </Typography>
              ) : null}
              
              <Typography data-testid="company-mail-addr-city-postal">
                {`${companyInfo.mailingAddress.city} ${companyInfo.mailingAddress.postalCode}`}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};
