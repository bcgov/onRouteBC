import { Box, Typography } from "@mui/material";

import "./ContactDetails.scss";
import { InfoBcGovBanner } from "../../../../common/components/banners/InfoBcGovBanner";
import { CustomFormComponent } from "../../../../common/components/form/CustomFormComponents";
import {
  invalidEmail,
  invalidExtensionLength,
  invalidPhoneLength,
  requiredMessage,
} from "../../../../common/helpers/validationMessages";
import { PHONE_WIDTH, EXT_WIDTH } from "../../../../themes/orbcStyles";
import { BANNER_MESSAGES } from "../../../../common/constants/bannerMessages";
import isEmail from "validator/lib/isEmail";

export const ContactDetails = ({ feature }: { feature: string }) => {
  return (
    <Box className="contact-details-form">
      <Box className="contact-details-form__header">
        <Typography variant={"h3"}>Contact Information</Typography>
      </Box>

      <Box className="contact-details-form__body">
        <CustomFormComponent
          type="input"
          feature={feature}
          options={{
            name: "permitData.contactDetails.firstName",
            rules: {
              required: { value: true, message: requiredMessage() },
            },
            label: "First Name",
          }}
        />

        <CustomFormComponent
          type="input"
          feature={feature}
          options={{
            name: "permitData.contactDetails.lastName",
            rules: {
              required: { value: true, message: requiredMessage() },
            },
            label: "Last Name",
          }}
        />

        <div className="mp-side-by-side-container">
          <CustomFormComponent
            type="phone"
            feature={feature}
            options={{
              name: "permitData.contactDetails.phone1",
              rules: {
                required: { value: true, message: requiredMessage() },
                validate: {
                  validatePhone: (phone: string) =>
                    (phone.length >= 10 && phone.length <= 20) ||
                    invalidPhoneLength(10, 20),
                },
              },

              label: "Phone Number",
              width: PHONE_WIDTH,
            }}
          />

          <CustomFormComponent
            type="number"
            feature={feature}
            options={{
              name: "permitData.contactDetails.phone1Extension",
              rules: {
                required: false,
                validate: {
                  validateExt1: (ext?: string) =>
                    !ext ||
                    ext.length === 0 ||
                    ext.length <= 5 ||
                    invalidExtensionLength(5),
                },
              },
              label: "Ext",
              width: EXT_WIDTH,
            }}
          />
        </div>

        <div className="mp-side-by-side-container">
          <CustomFormComponent
            type="phone"
            feature={feature}
            options={{
              name: "permitData.contactDetails.phone2",
              rules: {
                required: false,
                validate: {
                  validatePhone: (phone?: string) =>
                    !phone ||
                    phone.length === 0 ||
                    (phone.length >= 10 && phone.length <= 20) ||
                    invalidPhoneLength(10, 20),
                },
              },
              label: "Alternate Number",
              width: PHONE_WIDTH,
            }}
          />

          <CustomFormComponent
            type="number"
            feature={feature}
            options={{
              name: "permitData.contactDetails.phone2Extension",
              rules: {
                required: false,
                validate: {
                  validateExt2: (ext?: string) =>
                    !ext ||
                    ext.length === 0 ||
                    ext.length <= 5 ||
                    invalidExtensionLength(5),
                },
              },
              label: "Ext",
              width: EXT_WIDTH,
            }}
          />
        </div>

        <InfoBcGovBanner msg={BANNER_MESSAGES.PERMIT_SEND_TO} />

        <CustomFormComponent
          type="input"
          feature={feature}
          options={{
            name: "permitData.contactDetails.email",
            rules: {
              required: { value: true, message: requiredMessage() },
              validate: {
                validateEmail: (email: string) =>
                  isEmail(email) || invalidEmail(),
              },
            },
            label: "Company Email",
          }}
          disabled={true}
          readOnly={true}
        />

        <CustomFormComponent
          type="input"
          feature={feature}
          options={{
            name: "permitData.contactDetails.additionalEmail",
            rules: {
              required: false,
              validate: {
                validateEmail: (email?: string) =>
                  !email ||
                  email.length === 0 ||
                  isEmail(email) ||
                  invalidEmail(),
              },
            },
            label: "Additional Email",
          }}
        />

        <CustomFormComponent
          type="phone"
          feature={feature}
          options={{
            name: "permitData.contactDetails.fax",
            rules: { required: false },
            label: "Fax",
            width: PHONE_WIDTH,
          }}
        />
      </Box>
    </Box>
  );
};
