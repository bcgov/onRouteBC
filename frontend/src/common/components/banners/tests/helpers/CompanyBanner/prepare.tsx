import { render } from "@testing-library/react";

import { CompanyProfile } from "../../../../../../features/manageProfile/types/manageProfile";
import { CompanyBanner } from "../../../CompanyBanner";

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

export const renderTestComponent = (companyInfo?: CompanyProfile) => {
  return render(
    <CompanyBanner
      companyName={companyInfo?.legalName}
      clientNumber={companyInfo?.clientNumber}
    />,
  );
};
