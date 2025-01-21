import { memo } from "react";
import isEmail from "validator/lib/isEmail";

import "./UserInformationWizardForm.scss";
import { CustomFormComponent } from "../../../common/components/form/CustomFormComponents";
import { CountryAndProvince } from "../../../common/components/form/CountryAndProvince";
import { validatePhoneNumber } from "../../../common/helpers/phone/validatePhoneNumber";
import { validatePhoneExtension } from "../../../common/helpers/phone/validatePhoneExtension";
import { validateOptionalPhoneNumber } from "../../../common/helpers/phone/validateOptionalPhoneNumber";
import {
  invalidCityLength,
  invalidEmail,
  invalidFirstNameLength,
  invalidLastNameLength,
  requiredMessage,
} from "../../../common/helpers/validationMessages";

/**
 * The User Information Form contains multiple subs forms including
 * Company Info, Company Contact, Primary Contact, and Mailing Address Forms.
 * This Component contains the logic for React Hook forms and React query
 * for state management and API calls
 */
export const UserInformationWizardForm = memo(() => {
  const FEATURE = "wizard";

  return (
    <div className="user-info-wizard-form">
      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "adminUser.firstName",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validateFirstName: (firstName: string) =>
                (firstName.length >= 1 && firstName.length <= 100) ||
                invalidFirstNameLength(1, 100),
            },
          },
          label: "First Name",
        }}
        className="user-info-wizard-form__input"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "adminUser.lastName",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validateLastName: (lastName: string) =>
                (lastName.length >= 1 && lastName.length <= 100) ||
                invalidLastNameLength(1, 100),
            },
          },
          label: "Last Name",
        }}
        className="user-info-wizard-form__input"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "adminUser.email",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validateEmail: (email: string) =>
                isEmail(email) || invalidEmail(),
            },
          },
          label: "Email",
        }}
        className="user-info-wizard-form__input"
      />

      <div className="side-by-side-inputs">
        <CustomFormComponent
          type="phone"
          feature={FEATURE}
          options={{
            name: "adminUser.phone1",
            rules: {
              required: {
                value: true,
                message: requiredMessage(),
              },
              validate: {
                validatePhone1: (phone: string) => validatePhoneNumber(phone),
              },
            },
            label: "Primary Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />

        <CustomFormComponent
          type="ext"
          feature={FEATURE}
          options={{
            name: "adminUser.phone1Extension",
            rules: {
              required: false,
              validate: {
                validateExt1: (ext?: string) =>
                  validatePhoneExtension(ext),
              },
            },
            label: "Ext",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--right"
        />
      </div>

      <div className="side-by-side-inputs">
        <CustomFormComponent
          type="phone"
          feature={FEATURE}
          options={{
            name: "adminUser.phone2",
            rules: {
              required: false,
              validate: {
                validatePhone2: (phone?: string) => validateOptionalPhoneNumber(phone),
              },
            },
            label: "Alternate Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />

        <CustomFormComponent
          type="ext"
          feature={FEATURE}
          options={{
            name: "adminUser.phone2Extension",
            rules: {
              required: false,
              validate: {
                validateExt2: (ext?: string) =>
                  validatePhoneExtension(ext),
              },
            },
            label: "Ext",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--right"
        />
      </div>

      <CountryAndProvince
        feature={FEATURE}
        countryField="adminUser.countryCode"
        isCountryRequired={true}
        countryClassName="user-info-wizard-form__input"
        provinceField="adminUser.provinceCode"
        isProvinceRequired={true}
        provinceClassName="user-info-wizard-form__input"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "adminUser.city",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validateCity: (city: string) =>
                (city.length >= 1 && city.length <= 100) ||
                invalidCityLength(1, 100),
            },
          },
          label: "City",
        }}
        className="user-info-wizard-form__input"
      />
    </div>
  );
});

UserInformationWizardForm.displayName = "UserInformationWizardForm";
