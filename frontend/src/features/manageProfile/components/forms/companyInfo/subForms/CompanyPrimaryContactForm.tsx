import isEmail from "validator/lib/isEmail";

import "./CompanyPrimaryContactForm.scss";
import { CountryAndProvince } from "../../../../../../common/components/form/CountryAndProvince";
import { CustomFormComponent } from "../../../../../../common/components/form/CustomFormComponents";
import { validatePhoneNumber } from "../../../../../../common/helpers/phone/validatePhoneNumber";
import { validatePhoneExtension } from "../../../../../../common/helpers/phone/validatePhoneExtension";
import { validateOptionalPhoneNumber } from "../../../../../../common/helpers/phone/validateOptionalPhoneNumber";
import {
  invalidCityLength,
  invalidEmail,
  invalidFirstNameLength,
  invalidLastNameLength,
  requiredMessage,
} from "../../../../../../common/helpers/validationMessages";

export const CompanyPrimaryContactForm = ({ feature }: { feature: string }) => (
  <div className="company-primary-contact-form">
    <CustomFormComponent
      type="input"
      feature={feature}
      options={{
        name: "primaryContact.firstName",
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
      className="company-primary-contact-form__input"
    />

    <CustomFormComponent
      type="input"
      feature={feature}
      options={{
        name: "primaryContact.lastName",
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
      className="company-primary-contact-form__input"
    />

    <CustomFormComponent
      type="input"
      feature={feature}
      options={{
        name: "primaryContact.email",
        rules: {
          required: { value: true, message: requiredMessage() },
          validate: {
            validateEmail: (email: string) => isEmail(email) || invalidEmail(),
          },
        },
        label: "Email",
      }}
      className="company-primary-contact-form__input"
    />

    <div className="side-by-side-inputs">
      <CustomFormComponent
        type="phone"
        feature={feature}
        options={{
          name: "primaryContact.phone1",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validatePhone1: (phone: string) => validatePhoneNumber(phone),
            },
          },
          label: "Primary Phone",
        }}
        className="company-primary-contact-form__input company-primary-contact-form__input--left"
      />

      <CustomFormComponent
        type="ext"
        feature={feature}
        options={{
          name: "primaryContact.phone1Extension",
          rules: {
            required: false,
            validate: {
              validateExt1: (ext?: string) =>
                validatePhoneExtension(ext),
            },
          },
          label: "Ext",
        }}
        className="company-primary-contact-form__input company-primary-contact-form__input--right"
      />
    </div>

    <div className="side-by-side-inputs">
      <CustomFormComponent
        type="phone"
        feature={feature}
        options={{
          name: "primaryContact.phone2",
          rules: {
            required: false,
            validate: {
              validatePhone2: (phone?: string) => validateOptionalPhoneNumber(phone),
            },
          },
          label: "Alternate Phone",
        }}
        className="company-primary-contact-form__input company-primary-contact-form__input--left"
      />

      <CustomFormComponent
        type="ext"
        feature={feature}
        options={{
          name: "primaryContact.phone2Extension",
          rules: {
            required: false,
            validate: {
              validateExt2: (ext?: string) =>
                validatePhoneExtension(ext),
            },
          },
          label: "Ext",
        }}
        className="company-primary-contact-form__input company-primary-contact-form__input--right"
      />
    </div>

    <CountryAndProvince
      feature={feature}
      countryField="primaryContact.countryCode"
      isCountryRequired={true}
      countryClassName="company-primary-contact-form__input"
      provinceField="primaryContact.provinceCode"
      isProvinceRequired={true}
      provinceClassName="company-primary-contact-form__input"
    />

    <CustomFormComponent
      type="input"
      feature={feature}
      options={{
        name: "primaryContact.city",
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
      className="company-primary-contact-form__input"
    />
  </div>
);
