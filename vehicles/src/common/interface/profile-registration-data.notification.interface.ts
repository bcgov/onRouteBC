export interface ProfileRegistrationDataNotification {
  companyName: string;
  onRoutebBcClientNumber: string;
  companyAddressLine1: string;
  companyAddressLine2?: string;
  companyCountry: string;
  companyProvinceState: string;
  companyCity: string;
  companyPostalCode: string;
  companyEmail: string;
  companyPhoneNumber: string;
  primaryContactFirstname: string;
  primaryContactLastname: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  primaryContactExtension?: string;
  primaryContactAlternatePhoneNumber?: string;
  primaryContactCountry: string;
  primaryContactProvinceState: string;
  primaryContactCity: string;
}
