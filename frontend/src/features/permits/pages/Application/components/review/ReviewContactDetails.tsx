import { Box, Typography } from "@mui/material";

import "./ReviewContactDetails.scss";
import { DiffChip } from "./DiffChip";
import { Nullable } from "../../../../../../common/types/common";
import { PermitContactDetails } from "../../../../types/PermitContactDetails";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";

const nameDisplay = (firstName?: Nullable<string>, lastName?: Nullable<string>) => {
  if (!firstName) return getDefaultRequiredVal("", lastName);
  if (!lastName) return getDefaultRequiredVal("", firstName);
  return `${firstName} ${lastName}`;
};

const phoneDisplay = (phone?: Nullable<string>, ext?: Nullable<string>) => {
  if (!phone) return "";
  const firstPart = `${phone}`;
  const secondPart =
    getDefaultRequiredVal("", ext).trim() !== "" ? `Ext: ${ext}` : "";
  return `${firstPart} ${secondPart}`;
};

export const ReviewContactDetails = ({
  contactDetails,
  showChangedFields = false,
  oldFields = undefined,
}: {
  contactDetails?: Nullable<PermitContactDetails>;
  showChangedFields?: boolean;
  oldFields?: Nullable<PermitContactDetails>;
}) => {
  const changedFields = showChangedFields
    ? {
        name:
          nameDisplay(contactDetails?.firstName, contactDetails?.lastName) !==
          nameDisplay(oldFields?.firstName, oldFields?.lastName),
        phone1:
          phoneDisplay(
            contactDetails?.phone1,
            contactDetails?.phone1Extension,
          ) !== phoneDisplay(oldFields?.phone1, oldFields?.phone1Extension),
        phone2:
          phoneDisplay(
            contactDetails?.phone2,
            contactDetails?.phone2Extension,
          ) !== phoneDisplay(oldFields?.phone2, oldFields?.phone2Extension),
        email: areValuesDifferent(contactDetails?.email, oldFields?.email),
        additionalEmail: areValuesDifferent(
          contactDetails?.additionalEmail,
          oldFields?.additionalEmail,
        ),
      }
    : {
        name: false,
        phone1: false,
        phone2: false,
        email: false,
        additionalEmail: false,
      };

  return (
    <Box className="review-contact-details">
      <Box className="review-contact-details__header">
        <Typography
          variant={"h3"}
          className="review-contact-details__title"
          data-testid="review-contact-details-title"
        >
          Contact Information
        </Typography>
      </Box>

      <Box className="review-contact-details__body">
        <Box className="contact-details">
          <Typography className="contact-details__detail">
            <span
              className="contact-details__data"
              data-testid="review-contact-details-name"
            >
              {nameDisplay(contactDetails?.firstName, contactDetails?.lastName)}
            </span>

            {changedFields.name ? <DiffChip /> : null}
          </Typography>

          <Typography className="contact-details__detail">
            <span className="contact-details__label">Primary Phone:</span>

            <span
              className="contact-details__data"
              data-testid="review-contact-details-phone1"
            >
              {phoneDisplay(
                contactDetails?.phone1,
                contactDetails?.phone1Extension,
              )}
            </span>

            {changedFields.phone1 ? <DiffChip /> : null}
          </Typography>

          {contactDetails?.phone2 ? (
            <Typography className="contact-details__detail">
              <span className="contact-details__label">Alternate Phone:</span>

              <span
                className="contact-details__data"
                data-testid="review-contact-details-phone2"
              >
                {phoneDisplay(
                  contactDetails?.phone2,
                  contactDetails?.phone2Extension,
                )}
              </span>

              {changedFields.phone2 ? <DiffChip /> : null}
            </Typography>
          ) : null}

          <Typography className="contact-details__detail">
            <span className="contact-details__label">Company Email:</span>

            <span
              className="contact-details__data"
              data-testid="review-contact-details-email"
            >
              {contactDetails?.email}
            </span>

            {changedFields.email ? <DiffChip /> : null}
          </Typography>

          {contactDetails?.additionalEmail ? (
            <Typography className="contact-details__detail">
              <span className="contact-details__label">Additional Email:</span>

              <span
                className="contact-details__data"
                data-testid="review-contact-details-additional-email"
              >
                {contactDetails?.additionalEmail}
              </span>

              {changedFields.additionalEmail ? <DiffChip /> : null}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
