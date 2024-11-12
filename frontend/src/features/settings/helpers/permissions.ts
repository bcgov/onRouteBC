import { Nullable } from "../../../common/types/common";
import {
  DoesUserHaveRole,
  DoesUserHaveClaim,
} from "../../../common/authentication/util";
import {
  BCeIDUserRoleType,
  BCeID_USER_ROLE,
  IDIRUserRoleType,
  IDIR_USER_ROLE,
  CLAIMS,
  USER_ROLE,
  UserRoleType,
  UserClaimsType,
} from "../../../common/authentication/types";

/**
 * Determine whether or not a user can view/access suspend page/features given their roles.
 * @param userClaims claims that a user have
 * @returns Whether or not the user can view the suspend page/features
 */
export const canViewSuspend = (
  userClaims?: Nullable<UserClaimsType[]>,
): boolean => {
  return Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_SUSPEND));
};

/**
 * Determine whether or not a user can update suspend flag given their roles.
 * @param userClaims Claims that a user have
 * @returns Whether or not the user can update suspend flag
 */
export const canUpdateSuspend = (
  userClaims?: Nullable<UserClaimsType[]>,
): boolean => {
  return Boolean(DoesUserHaveClaim(userClaims, CLAIMS.WRITE_SUSPEND));
};

const READ_SPECIAL_AUTH_ALLOWED_ROLES = [
  USER_ROLE.PPC_CLERK,
  USER_ROLE.SYSTEM_ADMINISTRATOR,
  // USER_ROLE.TRAINEE,
  USER_ROLE.FINANCE,
  USER_ROLE.CTPO,
  USER_ROLE.ENFORCEMENT_OFFICER,
  USER_ROLE.HQ_ADMINISTRATOR,
  USER_ROLE.PERMIT_APPLICANT,
  USER_ROLE.COMPANY_ADMINISTRATOR,
] as UserRoleType[];

export const canUpdateNoFeePermitsFlag = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  const allowedRoles = [
    USER_ROLE.HQ_ADMINISTRATOR,
    USER_ROLE.FINANCE,
    USER_ROLE.SYSTEM_ADMINISTRATOR,
  ] as UserRoleType[];

  return (
    (userRole && allowedRoles.includes(userRole)) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.WRITE_NOFEE))
  );
};

export const canViewNoFeePermitsFlag = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  return (
    (userRole &&
      READ_SPECIAL_AUTH_ALLOWED_ROLES.includes(userRole)) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_NOFEE)) ||
    canUpdateNoFeePermitsFlag(userClaims, userRole)
  );
};

export const canUpdateLCVFlag = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  return (
    userRole === USER_ROLE.HQ_ADMINISTRATOR ||
    userRole === USER_ROLE.SYSTEM_ADMINISTRATOR ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.WRITE_LCV_FLAG))
  );
};

export const canViewLCVFlag = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  return (
    (userRole &&
      READ_SPECIAL_AUTH_ALLOWED_ROLES.includes(userRole)) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_LCV_FLAG)) ||
    canUpdateLCVFlag(userClaims, userRole)
  );
};

export const canUpdateLOA = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  const allowedRoles = [
    USER_ROLE.HQ_ADMINISTRATOR,
    USER_ROLE.SYSTEM_ADMINISTRATOR,
  ] as UserRoleType[];

  return (
    (userRole && allowedRoles.includes(userRole)) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.WRITE_LOA))
  );
};

export const canViewLOA = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  // Note that FIN is not allowed by view LOA
  const allowedRoles = [
    USER_ROLE.PPC_CLERK,
    USER_ROLE.CTPO,
    USER_ROLE.ENFORCEMENT_OFFICER,
    // USER_ROLE.TRAINEE,
    USER_ROLE.HQ_ADMINISTRATOR,
    USER_ROLE.SYSTEM_ADMINISTRATOR,
    USER_ROLE.COMPANY_ADMINISTRATOR,
    USER_ROLE.PERMIT_APPLICANT,
  ] as UserRoleType[];

  return (
    (userRole && allowedRoles.includes(userRole)) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_LOA)) ||
    canUpdateLOA(userClaims, userRole)
  );
};

export const canViewSpecialAuthorizations = (
  userClaims?: Nullable<UserClaimsType[]>,
  userRole?: Nullable<UserRoleType>,
): boolean => {
  return (
    (userRole &&
      READ_SPECIAL_AUTH_ALLOWED_ROLES.includes(userRole)) ||
    canViewNoFeePermitsFlag(userClaims, userRole) ||
    canViewLCVFlag(userClaims, userRole) ||
    canViewLOA(userClaims, userRole) ||
    Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_SPECIAL_AUTH))
  );
};

/**
 * Determine whether or not a user can view/access the settings tab given their roles.
 * @param userClaims claims that a user have
 * @returns Whether or not the user can view the settings tab
 */
export const canViewSettingsTab = (
  userClaims?: Nullable<UserClaimsType[]>,
): boolean => {
  // Need to update this check once Credit Accounts tabs/features are added
  return (
    canViewSuspend(userClaims) ||
    canUpdateSuspend(userClaims) ||
    canViewSpecialAuthorizations(userClaims) ||
    canViewCreditAccountTab(userClaims)
  );
};

/**
 * Determine whether or not a user can view/access credit account page/features given their roles.
 * @param userClaims claims that a user have
 * @returns Whether or not the user can view the credit account page/features
 */
export const canViewCreditAccountTab = (
  userClaims?: Nullable<UserClaimsType[]>,
): boolean => {
  return Boolean(DoesUserHaveClaim(userClaims, CLAIMS.READ_CREDIT_ACCOUNT));
};

/**
 * Determine whether or not a user can view CreditAccountDetails component showing available balance, credit limit etc.
 * @param userRoles Roles that a user have
 * @returns Whether or not the user can view the CreditAccountDetails component
 */
export const canViewCreditAccountDetails = (
  userRole?: BCeIDUserRoleType | IDIRUserRoleType,
): boolean => {
  return Boolean(
    DoesUserHaveRole({
      userRole: userRole,
      allowedRoles: [
        BCeID_USER_ROLE.COMPANY_ADMINISTRATOR,
        IDIR_USER_ROLE.SYSTEM_ADMINISTRATOR,
        IDIR_USER_ROLE.FINANCE,
      ],
    }),
  );
};

/**
 * Determine whether or not a user can add/remove users from and hold/remove credit accounts.
 * @param userClaims claims that a user have
 * @returns Whether or not the user can update the credit account
 */
export const canUpdateCreditAccount = (
  userClaims?: Nullable<UserClaimsType[]>,
): boolean => {
  return Boolean(DoesUserHaveClaim(userClaims, CLAIMS.WRITE_CREDIT_ACCOUNT));
};
