import { memo } from "react";

import "./UserInformationWizardForm.scss";
import { CustomFormComponent } from "../../../common/components/form/CustomFormComponents";
import { CountryAndProvince } from "../../../common/components/form/CountryAndProvince";

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
            required: { value: true, message: "First Name is required" },
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
            required: { value: true, message: "Last Name is required" },
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
            required: { value: true, message: "Email is required" },
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
                message: "Phone Number is required",
              },
            },
            label: "Primary Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />
        <CustomFormComponent
          type="input"
          feature={FEATURE}
          options={{
            name: "adminUser.phone1Extension",
            rules: { required: false },
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
            rules: { required: false },
            label: "Alternate Phone",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--left"
        />
        <CustomFormComponent
          type="input"
          feature={FEATURE}
          options={{
            name: "adminUser.phone2Extension",
            rules: { required: false },
            label: "Ext",
          }}
          className="user-info-wizard-form__input user-info-wizard-form__input--right"
        />
      </div>
      <CustomFormComponent
        type="input"
        feature={FEATURE}
        options={{
          name: "adminUser.fax",
          rules: { required: false },
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
            required: { value: true, message: "City is required" },
          },
          label: "City",
        }}
        className="user-info-wizard-form__input"
      />
    </div>
  );
});

UserInformationWizardForm.displayName = "UserInformationWizardForm";
