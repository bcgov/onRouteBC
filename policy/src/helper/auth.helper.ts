import { ForbiddenException } from '@nestjs/common';
import { Directory } from '../enum/directory.enum';
import { IDP } from '../enum/idp.enum';
import { Claim } from '../enum/claims.enum';
import { IUserJWT } from '../interface/user-jwt.interface';
import { UserRole, ClientUserRole, IDIRUserRole } from '../enum/user-role.enum';
import { IPermissions } from '../interface/permissions.interface';

/**
 * Determines the directory type based on the identity provider of the user.
 *
 * @param {IUserJWT} user - The user object containing the identity provider information.
 * @returns {Directory} The directory associated with the user's identity provider.
 */
export const getDirectory = (user: IUserJWT) => {
  if (user.identity_provider === IDP.IDIR) {
    return Directory.IDIR;
  } else if (user.identity_provider === IDP.BCEID) {
    if (user.bceid_business_guid) {
      return Directory.BBCEID;
    } else {
      return Directory.BCEID;
    }
  } else {
    return Directory.BCSC;
  }
};

/**
 * Evaluates if a user has at least one of the specified roles, belongs to the specified user authorization group, or meets complex role criteria.
 *
 * This method supports two kinds of inputs for role requirements:
 * 1. Simple list of roles (Role[]): It checks if the user holds any role from the specified list. True indicates possession of a required role.
 * 2. Complex role requirements (IRole[]): For each object defining roles with 'allOf', 'oneOf', and/or 'userRole', it evaluates:
 *    - If 'userRole' is defined, the user must belong to it.
 *    - For 'allOf', the user must have all specified roles.
 *    - For 'oneOf', the user must have at least one of the specified roles.
 * If any role object's criteria are met (considering 'userRole' if defined), it returns true.
 * Throws an error if both 'allOf' and 'oneOf' are defined in a role object.
 *
 * @param {IPermissions} permissions - An array of roles or role requirement objects to be matched against the user's roles.
 * @param {Claim[]} userClaims - An array of roles assigned to the user.
 * @param {UserRole} userRole - Optional. The user authorization group to which the user belongs.
 * @returns {boolean} Returns true if the user meets any of the defined role criteria or belongs to the specified user authorization group; false otherwise.
 */
export const matchRoles = (
  permissions: IPermissions,
  userClaims: Claim[],
  userRole?: UserRole,
) => {
  const { allowedIdirRoles, allowedBCeIDRoles, claim } = permissions;
  // If only claims is specified, return the value of that.
  if (claim && !allowedBCeIDRoles && !allowedIdirRoles) {
    return userClaims.includes(claim);
  }
  let isAllowed: boolean;
  const isIdir = userRole in IDIRUserRole;
  if (isIdir) {
    isAllowed = allowedIdirRoles?.includes(userRole as IDIRUserRole);
  } else {
    isAllowed = allowedBCeIDRoles?.includes(userRole as ClientUserRole);
  }
  // If claims is specified alongside the allowed roles, include
  // its value in the output.
  if (claim) {
    isAllowed = isAllowed && userClaims.includes(claim);
  }
  return isAllowed;
};

/**
 * Checks if any company from a list of associated companies matches any of the current user's associated companies.
 *
 * @param {number[]} associatedCompanies - An array of company IDs to check against.
 * @param {number[]} currentUserAssociatedCompanies - An array of the current user's associated company IDs.
 * @returns {boolean} True if there is at least one match; otherwise, false.
 */
export const matchCompanies = (
  associatedCompanies: number[],
  currentUserAssociatedCompanies: number[],
) => {
  return associatedCompanies.some((associatedCompany) =>
    currentUserAssociatedCompanies?.includes(associatedCompany),
  );
};

/**
 * Verifies if a user is associated with a given company by ID.
 *
 * @param {number} companyId - The ID of the company to check association with.
 * @param {number[]} userCompanies - An array of company IDs the user is associated with.
 * @returns {boolean} True if the user is associated with the given company; otherwise, false.
 */
export const checkAssociatedCompanies = (
  companyId: number,
  userCompanies: number[],
) => {
  return userCompanies?.includes(companyId);
};

/**
 * Validates if the user is either from the IDIR identity provider or associated with a given set of companies.
 *
 * Throws a ForbiddenException if the user does not meet the criteria:
 * - The user's identity provider is not IDIR, and
 * - The user's company ID is not in the list of provided userCompanies
 *
 * @param {number[]} userCompanies - An array of company IDs to check against the user's company ID.
 * @param {IUserJWT} user - The user object containing the identity provider and company ID.
 * @returns {boolean} Returns true if the user passes the validation checks.
 * @throws {ForbiddenException} Throws ForbiddenException if the user does not meet the required criteria.
 */
export const checkUserCompaniesContext = (
  userCompanies: number[],
  user: IUserJWT,
) => {
  if (
    user.identity_provider !== IDP.IDIR &&
    !checkAssociatedCompanies(user.companyId, userCompanies)
  ) {
    throw new ForbiddenException();
  }

  return true;
};

/**
 * Determines if a specified UserRole value is present within a given enumeration object.
 *
 * @param {UserRole} value - The UserRole value to be checked.
 * @param {ReadonlyArray<ClientUserRole> | ReadonlyArray<IDIRUserRole>} enumObject - An array of UserRole values.
 * @returns {boolean} Returns true if the value is present in the enumObject, otherwise false.
 */
export const doesUserHaveRole = (
  value: UserRole,
  enumObject: readonly ClientUserRole[] | readonly IDIRUserRole[],
): boolean => {
  // This function checks if the given value is present in the enumObject array
  return Object.values(enumObject).includes(value);
};
