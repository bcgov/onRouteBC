type PermitMailingAddress = {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string;
};

type PermitContactDetails = {
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: string | null;
  phone2?: string | null;
  phone2Extension?: string | null;
  email: string;
  additionalEmail?: string | null;
  fax?: string | null;
};

type PermitVehicleDetails = {
  vehicleId?: string | null;
  unitNumber?: string | null;
  vin: string;
  plate: string;
  make?: string | null;
  year?: number | null;
  countryCode: string;
  provinceCode: string;
  vehicleType: string;
  vehicleSubType: string;
  licensedGVW?: number | null;
  saveVehicle?: boolean | null;
};

type PermitCommodity = {
  description: string;
  condition: string;
  conditionLink: string;
  checked: boolean;
  disabled: boolean;
};

type PermitData = {
  companyName: string;
  doingBusinessAs?: string;
  clientNumber: string;
  permitDuration: number;
  commodities: Array<PermitCommodity>;
  contactDetails: PermitContactDetails;
  mailingAddress: PermitMailingAddress;
  vehicleDetails: PermitVehicleDetails;
  feeSummary?: string | null;
  startDate: string;
  expiryDate?: string | null;
  permittedCommodity?: PermittedCommodity | null;
  vehicleConfiguration?: VehicleConfiguration | null;
  permittedRoute?: PermittedRoute | null;
  applicationNotes?: string | null;
};

type PermittedCommodity = {
  commodityType: string;
  loadDescription: string;
};

type VehicleInConfiguration = {
  vehicleSubType: string;
};

type VehicleConfiguration = {
  overallLength?: number;
  overallWidth?: number;
  overallHeight?: number;
  frontProjection?: number;
  rearProjection?: number;
  trailers?: Array<VehicleInConfiguration> | null;
};

type PermittedRoute = {
  manualRoute?: ManualRoute | null;
  routeDetails?: string | null;
};

type ManualRoute = {
  highwaySequence: Array<string>;
  origin: string;
  destination: string;
  exitPoint?: string;
  totalDistance?: number;
};

type PermitApplication = {
  permitData: PermitData;
  permitType: string;
};

export default PermitApplication;
