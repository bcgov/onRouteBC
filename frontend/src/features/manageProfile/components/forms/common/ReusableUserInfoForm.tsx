import isEmail from "validator/lib/isEmail";
import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import {
  invalidCityLength,
  invalidEmail,
  invalidExtensionLength,
  invalidFirstNameLength,
  invalidLastNameLength,
  invalidPhoneLength,
  requiredMessage,
} from "../../../../../common/helpers/validationMessages";
import { CountryAndProvince } from "../../../../../common/components/form/CountryAndProvince";

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
                validatePhone1: (phone: string) =>
                  (phone.length >= 10 && phone.length <= 20) ||
                  invalidPhoneLength(10, 20),
              },
            },
            label: "Primary Phone",
          }}
          className="my-info-form__input my-info-form__input--left"
        />
        <CustomFormComponent
          type="number"
          feature={FEATURE}
          options={{
            name: "phone1Extension",
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
          className="my-info-form__input my-info-form__input--left"
        />
        <CustomFormComponent
          type="number"
          feature={FEATURE}
          options={{
            name: "phone2Extension",
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
          className="my-info-form__input my-info-form__input--right"
        />
      </div>
      <CustomFormComponent
        type="phone"
        feature={FEATURE}
        options={{
          name: "fax",
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
        className="my-info-form__input my-info-form__input--left"
      />
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
