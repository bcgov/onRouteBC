import { render } from "@testing-library/react";
import { CompanyProfile } from "../../../../../../manageProfile/types/manageProfile";
import { CompanyInformation } from "../../../CompanyInformation";
import { getProvinceFullName } from "../../../../../../../common/helpers/countries/getProvinceFullName";
import { getCountryFullName } from "../../../../../../../common/helpers/countries/getCountryFullName";

export const defaultCompanyInfo = {
  companyId: 74,
  companyGUID: "AB1CD2EFAB34567CD89012E345FA678B",
  clientNumber: "B3-000001-700",
  legalName: "My Company LLC",
  mailingAddress: {
    addressLine1: "123-4567 My Street",
    city: "Richmond",
    provinceCode: "BC",
    countryCode: "CA",
    postalCode: "V1C 2B3",
  },
  email: "companyhq@mycompany.co",
  phone: "604-123-4567",
  primaryContact: {
    firstName: "My",
    lastName: "Lastname",
    phone1: "604-123-4567",
    email: "my.company@mycompany.co",
    city: "Richmond",
    provinceCode: "BC",
    countryCode: "CA",
  },
  isSuspended: false,
};

export const country = getCountryFullName(
  defaultCompanyInfo.mailingAddress.countryCode,
);

export const province = getProvinceFullName(
  defaultCompanyInfo.mailingAddress.countryCode,
  defaultCompanyInfo.mailingAddress.provinceCode,
);

export const companyInfoTitle = "Company Information";
export const companyInfoDescription =
  "If the Company Mailing Address is incorrect, please contact your onRouteBC Administrator.";
export const companyMailAddrTitle = "Company Mailing Address";

export const renderTestComponent = (companyInfo?: CompanyProfile) => {
  return render(<CompanyInformation companyInfo={companyInfo} />);
};
