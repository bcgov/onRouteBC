import { Box, MenuItem, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

import "./PermitDetails.scss";
import { InfoBcGovBanner } from "../../../../../../common/components/banners/InfoBcGovBanner";
import { PermitExpiryDateBanner } from "../../../../../../common/components/banners/PermitExpiryDateBanner";
import { CustomFormComponent } from "../../../../../../common/components/form/CustomFormComponents";
import { PHONE_WIDTH } from "../../../../../../themes/bcGovStyles";
import { ConditionsTable } from "./ConditionsTable";
import { requiredMessage } from "../../../../../../common/helpers/validationMessages";
import { ONROUTE_WEBPAGE_LINKS } from "../../../../../../routes/constants";
import { CustomExternalLink } from "../../../../../../common/components/links/CustomExternalLink";
import { BANNER_MESSAGES } from "../../../../../../common/constants/bannerMessages";
import { PermitCondition } from "../../../../types/PermitCondition";
import { DATE_FORMATS } from "../../../../../../common/helpers/formatDate";
import {
  CustomDatePicker,
  PastStartDateStatus,
} from "../../../../../../common/components/form/subFormComponents/CustomDatePicker";

import {
  PPC_EMAIL,
  TOLL_FREE_NUMBER,
} from "../../../../../../common/constants/constants";

export const PermitDetails = ({
  feature,
  expiryDate,
  allConditions,
  durationOptions,
  disableStartDate,
  pastStartDateStatus,
  onSetConditions,
}: {
  feature: string;
  expiryDate: Dayjs;
  allConditions: PermitCondition[];
  durationOptions: {
    value: number;
    label: string;
  }[];
  disableStartDate: boolean;
  pastStartDateStatus: PastStartDateStatus;
  onSetConditions: (conditions: PermitCondition[]) => void;
}) => {
  const formattedExpiryDate = dayjs(expiryDate).format(DATE_FORMATS.SHORT);

  return (
    <Box className="permit-details">
      <Box className="permit-details__header">
        <Typography variant={"h3"}>Permit Details</Typography>
      </Box>

      <Box className="permit-details__body">
        <Box className="permit-details__input-section">
          <CustomDatePicker
            feature={feature}
            name="permitData.startDate"
            disabled={disableStartDate}
            readOnly={disableStartDate}
            rules={{
              required: { value: true, message: requiredMessage() },
            }}
            label="Start Date"
            pastStartDateStatus={pastStartDateStatus}
            maxDaysInFuture={14}
          />

          <CustomFormComponent
            type="select"
            feature={feature}
            options={{
              name: "permitData.permitDuration",
              rules: {
                required: { value: true, message: requiredMessage() },
              },
              label: "Permit Duration",
              width: PHONE_WIDTH,
            }}
            menuOptions={durationOptions.map((data) => (
              <MenuItem key={data.value} value={data.value}>
                {data.label}
              </MenuItem>
            ))}
          />
        </Box>

        <PermitExpiryDateBanner expiryDate={formattedExpiryDate} />

        <Box className="permit-details__conditions">
          <Typography variant="h3" className="conditions-title">
            Select the commodities below and their respective CVSE forms.
          </Typography>

          <InfoBcGovBanner
            msg={BANNER_MESSAGES.POLICY_REMINDER}
            additionalInfo={
              <div className="conditions-info">
                <div className="conditions-info__link">
                  <CustomExternalLink
                    className="procedures-link"
                    href={ONROUTE_WEBPAGE_LINKS.COMMERCIAL_TRANSPORT_PROCEDURES}
                    openInNewTab={true}
                    withLinkIcon={true}
                  >
                    <span className="procedures-link__title">
                      Commercial Transport Procedures - Province of British
                      Columbia
                    </span>
                  </CustomExternalLink>
                </div>

                <div className="conditions-info__contact-methods">
                  For further assistance please contact the Provincial Permit
                  Centre at{" "}
                  <span className="contact-info contact-info--toll-free">
                    Toll-free: {TOLL_FREE_NUMBER}
                  </span>{" "}
                  or{" "}
                  <span className="contact-info contact-info--email">
                    Email: {PPC_EMAIL}
                  </span>
                </div>
              </div>
            }
          />

          <ConditionsTable
            allConditions={allConditions}
            onSetConditions={onSetConditions}
          />
        </Box>
      </Box>
    </Box>
  );
};
