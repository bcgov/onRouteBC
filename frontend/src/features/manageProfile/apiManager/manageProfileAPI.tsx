import { ApiErrorResponse } from "../../../types/common";
import { MANAGE_PROFILE_API } from "./endpoints/endpoints";

interface Address {
  addressId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string;
}

interface Contact {
  contactId: number;
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: string;
  phone2?: string;
  phone2Extension?: string;
  email: string;
  city: string;
  provinceCode: string;
  countryCode: string;
}

export interface CompanyProfile {
  companyGUID: string;
  clientNumber: string;
  legalName: string;
  companyAddress: Address;
  mailingAddressSameAsCompanyAddress: boolean;
  mailingAddress?: Address;
  email: string;
  phone: string;
  extension?: string;
  fax?: string;
  primaryContact: Contact;
}

// I have hardcoded the companyGUID because for this sprint we have assumed
// that the user has logged in with BCeID and has already completed the
// Wizard to setup their initial company profile
let TEST_COMPANY_GUID = "06D0D93CE18A43948979F255C7046B72";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const getCompanyInfo = async (
  companyGUID: string
): Promise<CompanyProfile> => {
  //return TEST_DATA;
  const url = new URL(MANAGE_PROFILE_API.COMPANY_INFO);

  try {
    const response = await fetch(`${url.href}/${TEST_COMPANY_GUID}`);
    const data = await response.json();

    // Handle API errors created from the backend API
    if (!response.ok) {
      const err: ApiErrorResponse = data;
      return Promise.reject(err.errorMessage);
    }
    return data;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle network errors
    // Error type has name and message
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return Promise.reject(error.message);
  }
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const updateCompanyInfo = async ({
  companyGUID,
  companyInfo,
}: {
  companyGUID: string;
  companyInfo: CompanyProfile;
}): Promise<Response> => {
  console.log("companyInfo", companyInfo);
  return fetch(`${MANAGE_PROFILE_API.COMPANY_INFO}/${TEST_COMPANY_GUID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(companyInfo),
  });
};

const TEST_POST_DATA = {
  legalName: "ABC Carriers Inc.",
  companyAddress: {
    addressLine1: "1234 Main St.",
    addressLine2: "Unit 321",
    city: "Vancouver",
    provinceCode: "BC",
    countryCode: "CA",
    postalCode: "V8W2E7",
  },
  mailingAddressSameAsCompanyAddress: true,
  mailingAddress: {
    addressLine1: "1234 Main St.",
    addressLine2: "Unit 321",
    city: "Vancouver",
    provinceCode: "BC",
    countryCode: "CA",
    postalCode: "V8W2E7",
  },
  phone: "9999999999",
  extension: "99999",
  fax: "9999999999",
  email: "test@test.gov.bc.ca",
  primaryContact: {
    firstName: "Adam",
    lastName: "Smith",
    phone1: "9999999999",
    phone1Extension: "99999",
    phone2: "9999999999",
    phone2Extension: "99999",
    email: "test@test.gov.bc.ca",
    city: "Vancouver",
    provinceCode: "BC",
    countryCode: "CA",
  },
};

export const createCompanyInfo = async (): Promise<CompanyProfile> => {
  const response = await fetch(`${MANAGE_PROFILE_API.COMPANY_INFO}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(TEST_POST_DATA),
  });

  const data = (await response.json()) as CompanyProfile;

  TEST_COMPANY_GUID = data.companyGUID;

  return data;
};
