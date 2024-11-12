import { ThirdPartyLiability } from '../enum/third-party-liability.enum';

// Data used to populate a .docx template
export interface PermitTemplateData {
  permitName: string;
  permitNumber: string;
  permitType: string;
  createdDateTime: string;
  updatedDateTime: string;
  companyName: string;
  companyAlternateName: string;
  clientNumber: string;
  issuedBy: string;
  revisions: Revision[];
  permitData?: PermitData;
  loas?: string;
}

interface Revision {
  timeStamp: string;
  description: string;
}

export interface PermitData {
  startDate: string;
  permitDuration: number; //days
  expiryDate: string;
  feeSummary: string;
  contactDetails?: ContactDetails;
  vehicleDetails?: VehicleDetails;
  commodities: Commodities[];
  loas: Loas[]; //Letter of Authorizations
  mailingAddress: MailingAddress;
  companyName: string;
  clientNumber: string;
  vehicleConfiguration?: VehicleConfiguration;
  applicationNotes?: string;
  permittedCommodity?: PermittedCommodity;
  permittedRoute?: PermittedRoute;
  /**
   * Third Party Liability for Non resident ICBC permits
   */
  thirdPartyLiability?: ThirdPartyLiability;
}

interface VehicleConfiguration {
  overallLength: number;
  overallWidth: number;
  overallHeight: number;
  frontProjection: number;
  rearProjection: number;
  trailers: VehicleDetails[];
}

interface PermittedRoute {
  routeDetails: string;
  manualRoute: ManualRoute;
}

interface PermittedCommodity {
  commodityType: string;
  loadDescription: string;
}

interface ManualRoute {
  origin: string;
  destination: string;
  exitPoint?: string;
  totalDistance?: number;
  highwaySequence?: string[];
}

interface MailingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string;
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: string;
  phone2?: string;
  phone2Extension?: string;
  email: string;
  additionalEmail?: string;
  fax?: string;
}

interface VehicleDetails {
  vin: string;
  plate: string;
  make: string;
  year: number | null;
  countryCode: string;
  provinceCode: string;
  vehicleType: string;
  vehicleSubType: string;
  licensedGVW?: number;
  saveVehicle?: boolean;
}

interface Commodities {
  description: string;
  condition: string;
  conditionLink: string;
  checked: boolean;
  disabled?: boolean;
}

interface Loas {
  loaId: string;
  checked: boolean;
  disabled?: boolean;
}
