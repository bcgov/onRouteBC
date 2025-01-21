import isEmail from "validator/lib/isEmail";

import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import { CountryAndProvince } from "../../../../../common/components/form/CountryAndProvince";
import { validatePhoneNumber } from "../../../../../common/helpers/phone/validatePhoneNumber";
import { validateOptionalPhoneNumber } from "../../../../../common/helpers/phone/validateOptionalPhoneNumber";
import { validatePhoneExtension } from "../../../../../common/helpers/phone/validatePhoneExtension";
import {
  invalidCityLength,
  invalidEmail,
  invalidFirstNameLength,
  invalidLastNameLength,
  requiredMessage,
} from "../../../../../common/helpers/validationMessages";

/**
 * Reusable form for editing user information.
 * Needs a form context.
 */
export const ReusableUserInfoForm = ({
  feature: FEATURE = "user-info",
}: {
  /**
   * The name of the feature that the form is being used for.
   */
  feature: string;
}) => {
  return (
    <div className="my-info-form">
      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "firstName",
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
        className="my-info-form__input"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "lastName",
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
        className="my-info-form__input"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "email",
          rules: {
            required: { value: true, message: requiredMessage() },
            validate: {
              validateEmail: (email: string) =>
                isEmail(email) || invalidEmail(),
            },
          },
          label: "Email",
        }}
        className="my-info-form__input"
      />

      <div className="side-by-side-inputs">
        <CustomFormComponent
          type="phone"
          feature={FEATURE}
          options={{
            name: "phone1",
            rules: {
              required: { value: true, message: requiredMessage() },
              validate: {
                validatePhone1: validatePhoneNumber,
              },
            },
            label: "Primary Phone",
          }}
          className="my-info-form__input my-info-form__input--left"
        />

        <CustomFormComponent
          type="ext"
          feature={FEATURE}
          options={{
            name: "phone1Extension",
            rules: {
              required: false,
              validate: {
                validateExt1: (ext?: string) =>
                  validatePhoneExtension(ext),
              },
            },
            label: "Ext",
          }}
          className="my-info-form__input my-info-form__input--right"
        />
      </div>

      <div className="side-by-side-inputs">
        <CustomFormComponent
          type="phone"
          feature={FEATURE}
          options={{
            name: "phone2",
            rules: {
              required: false,
              validate: {
                validatePhone2: (phone?: string) => {
                  return validateOptionalPhoneNumber(phone);
                },
              },
            },
            label: "Alternate Phone",
          }}
          className="my-info-form__input my-info-form__input--left"
        />

        <CustomFormComponent
          type="ext"
          feature={FEATURE}
          options={{
            name: "phone2Extension",
            rules: {
              required: false,
              validate: {
                validateExt2: (ext?: string) =>
                  validatePhoneExtension(ext),
              },
            },
            label: "Ext",
          }}
          className="my-info-form__input my-info-form__input--right"
        />
      </div>

      <CountryAndProvince
        feature={FEATURE}
        countryField="countryCode"
        provinceField="provinceCode"
        width="100%"
      />

      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "city",
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
        className="my-info-form__input"
      />
    </div>
  );
};
