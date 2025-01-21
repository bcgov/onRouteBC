import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

export const reviewConfirmWarning = async () => {
  return await screen.findByText(
    "Please review and confirm that the information below is correct.",
  );
};

export const companyInfoHeaderTitle = async () => {
  return await screen.findByTestId("company-info-header-title");
};

export const companyInfoHeaderDescription = async () => {
  return await screen.findByTestId("company-info-header-desc");
};

export const applicationHeaderTitle = async () => {
  return await screen.findByTestId("application-title");
};

export const applicationNumber = async () => {
  return await screen.findByTestId("application-number");
};

export const applicationCreatedDate = async () => {
  return await screen.findByTestId("application-created-date");
};

export const applicationUpdatedDate = async () => {
  return await screen.findByTestId("application-updated-date");
};

export const companyNameLabel = async () => {
  return await screen.findByTestId("company-banner-name-label");
};

export const companyName = async () => {
  return await screen.findByTestId("company-banner-name");
};

export const companyClientLabel = async () => {
  return await screen.findByTestId("company-banner-client-label");
};

export const companyClientNumber = async () => {
  return await screen.findByTestId("company-banner-client");
};

export const companyMailAddrHeaderTitle = async () => {
  return await screen.findByTestId("company-mail-addr-title");
};

export const companyMailAddrLine1 = async () => {
  return await screen.findByTestId("company-mail-addr-line1");
};

export const companyMailAddrCountry = async () => {
  return await screen.findByTestId("company-mail-addr-country");
};

export const companyMailAddrProvince = async () => {
  return await screen.findByTestId("company-mail-addr-prov");
};

export const companyMailAddrCityPostal = async () => {
  return await screen.findByTestId("company-mail-addr-city-postal");
};

export const contactInfoHeaderTitle = async () => {
  return await screen.findByTestId("review-contact-details-title");
};

export const contactInfoName = async () => {
  return await screen.findByTestId("review-contact-details-name");
};

export const contactInfoPhone1 = async () => {
  return await screen.findByTestId("review-contact-details-phone1");
};

export const contactInfoPhone2 = async () => {
  return await screen.findByTestId("review-contact-details-phone2");
};

export const contactInfoEmail = async () => {
  return await screen.findByTestId("review-contact-details-email");
};

export const contactInfoAdditionalEmail = async () => {
  return await screen.findByTestId("review-contact-details-additional-email");
};

export const permitStartDate = async () => {
  return await screen.findByTestId("permit-start-date");
};

export const permitDuration = async () => {
  return await screen.findByTestId("permit-duration");
};

export const permitExpiryDate = async () => {
  return await screen.findByTestId("permit-expiry-date");
};

export const permitConditions = async () => {
  return await screen.findAllByTestId("review-permit-condition");
};

export const permitConditionDescriptions = async () => {
  return await screen.findAllByTestId("permit-condition-description");
};

export const permitConditionLinks = async () => {
  return await screen.findAllByTestId("permit-condition-link");
};

export const permitConditionCodes = async () => {
  return await screen.findAllByTestId("permit-condition-code");
};

export const vehicleUnitNumber = async () => {
  return await screen.findByTestId("review-vehicle-unit-number");
};

export const vehicleVIN = async () => {
  return await screen.findByTestId("review-vehicle-vin");
};

export const vehiclePlate = async () => {
  return await screen.findByTestId("review-vehicle-plate");
};

export const vehicleMake = async () => {
  return await screen.findByTestId("review-vehicle-make");
};

export const vehicleYear = async () => {
  return await screen.findByTestId("review-vehicle-year");
};

export const vehicleCountry = async () => {
  return await screen.findByTestId("review-vehicle-country");
};

export const vehicleProvince = async () => {
  return await screen.findByTestId("review-vehicle-province");
};

export const vehicleTypeDisplay = async () => {
  return await screen.findByTestId("review-vehicle-type");
};

export const vehicleSubtypeDisplay = async () => {
  return await screen.findByTestId("review-vehicle-subtype");
};

export const vehicleSavedMsg = async () => {
  return await screen.findByTestId("review-vehicle-saved-msg");
};

export const feeSummaryPermitType = async () => {
  return await screen.findByTestId("fee-summary-permit-type");
};

export const feeSummaryPrice = async () => {
  return await screen.findByTestId("fee-summary-price");
};

export const feeSummaryTotal = async () => {
  return await screen.findByTestId("fee-summary-total");
};

export const attestationCheckboxes = async () => {
  return await screen.findAllByTestId("permit-attestation-checkbox");
};

export const checkAttestations = async (
  user: UserEvent,
  attestations: number[],
) => {
  const checkboxes = await attestationCheckboxes();
  await Promise.all(
    attestations.map(async (attestation) => {
      if (attestation >= 0 && attestation < checkboxes.length) {
        return await user.click(checkboxes[attestation]);
      }
      return Promise.resolve();
    }),
  );
};

export const attestationErrorMsg = async () => {
  return await screen.findByTestId("permit-attestation-checkbox-error");
};

export const proceedToAddToCart = async (user: UserEvent) => {
  const addToCartBtn = await screen.findByTestId("add-to-cart-btn");
  await user.click(addToCartBtn);
};

export const proceedToPay = async (user: UserEvent) => {
  const payBtn = await screen.findByTestId("continue-btn");
  await user.click(payBtn);
};
