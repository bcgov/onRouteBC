import React, { Dispatch, SetStateAction } from "react";
import {
  IDIRUserRoleType,
  VerifiedClient,
  UserClaimsType,
  BCeIDUserRoleType,
} from "./types";

import { Nullable, Optional } from "../types/common";

/**
 * The user details to be set in the context.
 */
export type IDIRUserDetailContext = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userRole: IDIRUserRoleType;
};

/**
 * The user details to be set in the context.
 */
export interface BCeIDUserDetailContext {
  firstName: string;
  lastName: string;
  userName: string;
  phone1: string;
  phone1Extension?: string;
  phone2?: string;
  phone2Extension?: string;
  email: string;
  userRole: BCeIDUserRoleType;
}

/**
 * The data and functions to in the react context.
 */
export type OnRouteBCContextType = {
  /**
   * React state setter for the claims of the logged in user.
   */
  setUserClaims?: Dispatch<SetStateAction<Nullable<UserClaimsType[]>>>;
  /**
   * The claims of the logged in user.
   */
  userClaims?: Nullable<UserClaimsType[]>;
  /**
   * React state setter for the clientNumber of the company in context.
   */
  setOnRouteBCClientNumber?: Dispatch<SetStateAction<Optional<string>>>;
  /**
   * The clientNumber of the company in context.
   */
  onRouteBCClientNumber?: string;
  /**
   * React state setter for the BCeID user that is logged in.
   */
  setUserDetails?: Dispatch<SetStateAction<Optional<BCeIDUserDetailContext>>>;
  /**
   * The details of the BCeID user that is logged in.
   */
  userDetails?: BCeIDUserDetailContext;
  /**
   * React state setter for the id of the company in context.
   */
  setCompanyId?: Dispatch<SetStateAction<Optional<number>>>;
  /**
   * The id of the company in context.
   * Value is set and available only if
   *  - user is a BCeID user with a company in the system.
   *  - staff acts a company.
   */
  companyId?: number;
  setCompanyLegalName?: Dispatch<SetStateAction<Optional<string>>>;
  /**
   * The name of the company in context.
   * Value is set and available only if
   *  - user is a BCeID user with a company in the system.
   *  - staff acts a company.
   */
  companyLegalName?: string;
  /**
   * Whether or not the company in context is suspended.
   * Value is set and available only if
   *  - user is a BCeID user with a company in the system.
   *  - staff acts a company.
   */
  isCompanySuspended?: boolean;
  /**
   * React state setter for if the company in context is suspended.
   */
  setIsCompanySuspended?: Dispatch<SetStateAction<Optional<boolean>>>;
  /**
   * The user details of a IDIR user logged in.
   * Will have values only when the user is idir and set up in the system.
   */
  idirUserDetails?: IDIRUserDetailContext;
  /**
   * React state setter for the user details of a IDIR user logged in.
   */
  setIDIRUserDetails?: Dispatch<
    SetStateAction<Optional<IDIRUserDetailContext>>
  >;
  /**
   * React state setter for a legacy client details.
   * Used only when the user is new and trying to claim their company.
   */
  setMigratedClient?: Dispatch<SetStateAction<Optional<VerifiedClient>>>;
  /**
   * The legacy client details.
   * Used only when the user is new and trying to claim their company.
   */
  migratedClient?: VerifiedClient;
  /**
   * Is the logged in user a new BCeID user?
   */
  isNewBCeIDUser?: boolean;
  /**
   * React state setter for setting new BCeID user.
   * Used only when the user is new and trying to claim their company.
   */
  setIsNewBCeIDUser?: Dispatch<SetStateAction<Optional<boolean>>>;
  /**
   * A utility function to clear the company context.
   * Intended for use during staff act as company.
   * @returns void
   */
  clearCompanyContext?: () => void;
};

const defaultBehaviour: OnRouteBCContextType = {};

const OnRouteBCContext =
  React.createContext<OnRouteBCContextType>(defaultBehaviour);

export default OnRouteBCContext;
