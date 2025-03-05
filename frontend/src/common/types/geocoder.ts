import { Nullable } from "./common";

interface GeometryPoint {
  type: "Point";
  crs: {
    type: string; // "EPSG"
    properties: {
      code: number; // 4326
    };
  };
  coordinates: [number, number];
};

export interface GeocoderQueryOptions {
  autoComplete?: boolean;
  maxResults?: number;
  minScore?: number;
  echo?: boolean;
  brief?: boolean;
  locationDescriptor?: string;
  outputSRS?: number;
};

export interface GeocoderFeature {
  type: "Feature";
};

export interface GeocoderAddressProps {
  fullAddress: string;
  score: number;
  matchPrecision: string;
  precisionPoints: number;
  faults: string | string[];
  siteName: string;
  unitDesignator: string;
  unitNumber: string;
  unitNumberSuffix: string;
  civicNumber: string;
  civicNumberSuffix: string;
  streetName: string;
  streetType: string;
  isStreetTypePrefix: "" | "true" | "false" | boolean;
  streetDirection: string;
  isStreetDirectionPrefix: "" | "true" | "false" | boolean;
  streetQualifier: "";
  localityName: string;
  localityType: string;
  electoralArea: string;
  provinceCode: string;
  locationPositionalAccuracy: string;
  locationDescriptor: string;
  siteID: string;
  blockID: string;
  fullSiteDescriptor: string;
  accessNotes: string;
  siteStatus: string;
  siteRetireDate: string;
  changeDate: string;
  isOfficial: "" | "true" | "false" | boolean;
  streetAddress?: Nullable<string>;
};

export interface GeocoderAddressFeature extends GeocoderFeature {
  geometry: GeometryPoint;
  properties: GeocoderAddressProps;
};

interface GeocoderResponse {
  searchTimestamp: string;
  executionTime: number;
  version: string;
  minScore: number;
  maxResults: number;
  echo: "true" | "false" | boolean;
  interpolation: string;
  outputSRS?: Nullable<number>;
  setBack: number;
};

export interface GeocoderAddressResponse extends GeocoderResponse {
  type: "FeatureCollection";
  features: GeocoderAddressFeature[];
};
