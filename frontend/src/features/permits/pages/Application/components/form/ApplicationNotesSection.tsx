import { Box } from "@mui/material"

import "./ApplicationNotesSection.scss";
import { CustomFormComponent } from "../../../../../../common/components/form/CustomFormComponents";
import { PERMIT_TYPES, PermitType } from "../../../../types/PermitType";
import { InfoBcGovBanner } from "../../../../../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../../../../../common/constants/bannerMessages";

export const ApplicationNotesSection = ({
  feature,
  permitType,
}: {
  feature: string;
  permitType: PermitType;
}) => {
  return permitType === PERMIT_TYPES.STOS ? (
    <Box className="application-notes-section">
      <Box className="application-notes-section__header">
        <h3 className="application-notes-section__title">
          Application Notes
        </h3>
      </Box>

      <Box className="application-notes-section__body">
        <InfoBcGovBanner
          className="application-notes-section__info"
          msg={BANNER_MESSAGES.APPLICATION_NOTES}
          additionalInfo={
            <div className="application-notes-info">
              <p className="application-notes-info__details application-notes-info__details--example">
                {BANNER_MESSAGES.APPLICATION_NOTES_EXAMPLE}
              </p>

              <p className="application-notes-info__details application-notes-info__details--info">
                {BANNER_MESSAGES.APPLICATION_NOTES_INFO}
              </p>
            </div>
          }
        />

        <CustomFormComponent
          type="textarea"
          feature={feature}
          className="application-notes-section__input"
          options={{
            name: "permitData.applicationNotes",
            rules: {
              required: false,
            },
            label: "Application Notes",
          }}
        />
      </Box>
    </Box>
  ) : null;
};

