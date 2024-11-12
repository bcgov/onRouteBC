import { memo } from "react";
import isEmail from "validator/lib/isEmail";

import "./UserInformationWizardForm.scss";
import { CustomFormComponent } from "../../../common/components/form/CustomFormComponents";
import { CountryAndProvince } from "../../../common/components/form/CountryAndProvince";
import {
  invalidCityLength,
  invalidEmail,
  invalidExtensionLength,
  invalidFirstNameLength,
  invalidLastNameLength,
  invalidPhoneLength,
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
                validatePhone1: (phone: string) =>
                  (phone.length >= 10 && phone.length <= 20) ||
                  invalidPhoneLength(10, 20),
              },
            },
            label: "Primary Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />
        <CustomFormComponent
          type="number"
          feature={FEATURE}
          options={{
            name: "adminUser.phone1Extension",
            rules: {
              required: false,
              validate: {
                validateExt1: (ext?: string) =>
                  ext == null ||
                  ext === "" ||
                  (ext != null && ext !== "" && ext.length <= 5) ||
                  invalidExtensionLength(5),
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
                validatePhone2: (phone2?: string) =>
                  phone2 == null ||
                  phone2 === "" ||
                  (phone2 != null &&
                    phone2 !== "" &&
                    phone2.length >= 10 &&
                    phone2.length <= 20) ||
                  invalidPhoneLength(10, 20),
              },
            },
            label: "Alternate Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />
        <CustomFormComponent
          type="number"
          feature={FEATURE}
          options={{
            name: "adminUser.phone2Extension",
            rules: {
              required: false,
              validate: {
                validateExt2: (ext?: string) =>
                  ext == null ||
                  ext === "" ||
                  (ext != null && ext !== "" && ext.length <= 5) ||
                  invalidExtensionLength(5),
              },
            },
            label: "Ext",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--right"
        />
      </div>
      <CustomFormComponent
        type="phone"
        feature={FEATURE}
        options={{
          name: "adminUser.fax",
          rules: {
            required: false,
            validate: {
              validateFax: (fax?: string) =>
                fax == null ||
                fax === "" ||
                (fax != null &&
                  fax !== "" &&
                  fax.length >= 10 &&
                  fax.length <= 20) ||
                invalidPhoneLength(10, 20),
            },
          },
          label: "Fax",
        }}
        className="user-info-wizard-form__input user-info-wizard-form__input--left"
      />
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
