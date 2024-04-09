import { SearchFields } from "../../features/idir/search/types/types";
import { Application } from "../../features/permits/types/application";
import { PermitContactDetails } from "../../features/permits/types/PermitContactDetails";
import {
  CreateCompanyRequest,
  CompanyProfile,
  UserInfoRequest,
  VerifyClientRequest,
  BCeIDAddUserRequest,
} from "../../features/manageProfile/types/manageProfile";

import {
  PowerUnit,
  Trailer,
} from "../../features/manageVehicles/types/Vehicle";

export interface ApiErrorResponse {
  status: number;
  errorMessage: string; // array?
}

/**
 * The types of onRouteBC forms that are supported by the custom form components
 */
export type ORBC_FormTypes =
  | CompanyProfile
  | PowerUnit
  | Trailer
  | Application
  | UserInfoRequest
  | CreateCompanyRequest
  | BCeIDAddUserRequest
  | SearchFields
  | VerifyClientRequest
  | PermitContactDetails;

/**
 * The options for pagination.
 */
export type PaginationOptions = {
  /**
   * The page number to fetch.
   */
  page: number;
  /**
   * The number of items in the current page.
   * Max. value is 25.
   */
  take: number;
};

/**
 * The sort directions.
 */
export const SORT_DIRECTIONS = {
  ASCENDING: "ASC",
  DESCENDING: "DESC",
} as const;

export type SortDirectionsType =
  (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS];

/**
 * The config for sorting data.
 */
export type SortingConfig = {
  /**
   * The field to order by.
   */
  column: string;
  /**
   * Boolean indicating if the sort is in descending order.
   * If not given a value, defaulted to false.
   */
  descending?: boolean;
};

/**
 * Additional data filters that could be used for
 * filtering data further.
 */
export type DataFilterOptions = {
  /**
   * The search value entered by the user.
   */
  searchString?: string;
  /**
   * The sorting configuration selected by the user.
   */
  orderBy?: Array<SortingConfig>;
};

export type PendingOption = {
  pendingPermits?: boolean;
}

/**
 * The options for pagination and filtering data.
 */
export type PaginationAndFilters = PaginationOptions & DataFilterOptions & PendingOption;

/**
 * A generic paginated response structure for all the paginated responses from APIs.
 */
export type PaginatedResponse<T> = {
  /**
   * An array of items containing the response T.
   */
  items: T[];
  /**
   * Metadata about a page.
   */
  meta: PageMetadataInResponse;
};

/**
 * The metadata containing info about a page in the paginated response.
 */
export type PageMetadataInResponse = {
  /**
   * The total items matching the query in the database.
   */
  totalItems: number;
  /**
   * The total number of pages.
   */
  pageCount: number;
  /**
   * Is there a previous page?
   */
  hasPreviousPage: boolean;
  /**
   * Is there a next page?
   */
  hasNextPage: boolean;
} & PaginationOptions;

export type Optional<T> = T | undefined;
export type RequiredOrNull<T> = T | null;
export type Nullable<T> = Optional<RequiredOrNull<T>>;
export type NullableFields<T> = {
  [P in keyof T]?: Nullable<T[P]>;
};
