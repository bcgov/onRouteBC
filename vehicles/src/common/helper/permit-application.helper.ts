import { Permit } from '../../modules/permit-application-payment/permit/entities/permit.entity';
import { PermitData } from '../interface/permit.template.interface';
import { getFromCache } from './cache.helper';
import { FullNamesForDgen } from '../interface/full-names-for-dgen.interface';
import { Cache } from 'cache-manager';
import { CacheKey } from '../enum/cache-key.enum';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { callDatabaseSequence } from './database.helper';
import { PermitApplicationOrigin as PermitApplicationOriginEnum } from '../enum/permit-application-origin.enum';
import { PermitApprovalSource as PermitApprovalSourceEnum } from '../enum/permit-approval-source.enum';
import { randomInt } from 'crypto';
import { Directory } from '../enum/directory.enum';
import { doesUserHaveRole } from './auth.helper';
import { IDIR_USER_ROLE_LIST, UserRole } from '../enum/user-role.enum';
import { PPC_FULL_TEXT } from '../constants/api.constant';
import { User } from '../../modules/company-user-management/users/entities/user.entity';
import { ApplicationStatus } from '../enum/application-status.enum';
import { PermitType } from '../enum/permit-type.enum';
import { PERMIT_TYPES_FOR_QUEUE } from '../constants/permit.constant';
import * as dayjs from 'dayjs';

/**
 * Fetches and resolves various types of names associated with a permit using cache.
 * It converts coded names (e.g., type codes, country codes) into their full descriptive names
 * for both vehicle and mailing address. Also resolves permit name based on its type.
 * - Vehicle type and subtype names are resolved based on their codes.
 * - Country and province/state names for both the vehicle registration and mailing address.
 * - Permit type name is also resolved to its full descriptive name.
 * Example of conversion: 'TROS' to 'Oversize: Term'
 * @param cacheManager An instance of Cache used for fetching data.
 * @param permit The permit object containing information about the permit.
 * @returns a Promise that resolves to an object containing the full descriptive names.
 */
export const fetchPermitDataDescriptionValuesFromCache = async (
  cacheManager: Cache,
  permit: Permit,
): Promise<FullNamesForDgen> => {
  const permitData = JSON.parse(permit.permitData.permitData) as PermitData;

  const vehicleTypeName = await getFromCache(
    cacheManager,
    CacheKey.VEHICLE_TYPE,
    permitData.vehicleDetails.vehicleType,
  );

  const vehicleSubTypeName = await getFromCache(
    cacheManager,
    vehicleTypeName === 'Trailer'
      ? CacheKey.TRAILER_TYPE
      : CacheKey.POWER_UNIT_TYPE,
    permitData.vehicleDetails.vehicleSubType,
  );

  const mailingCountryName = await getFromCache(
    cacheManager,
    CacheKey.COUNTRY,
    permitData.vehicleDetails.countryCode,
  );
  const mailingProvinceName = permitData.vehicleDetails.provinceCode
    ? await getFromCache(
        cacheManager,
        CacheKey.PROVINCE,
        permitData.vehicleDetails.provinceCode,
      )
    : null;

  const vehicleCountryName = await getFromCache(
    cacheManager,
    CacheKey.COUNTRY,
    permitData.mailingAddress.countryCode,
  );
  const vehicleProvinceName = permitData.mailingAddress.provinceCode
    ? await getFromCache(
        cacheManager,
        CacheKey.PROVINCE,
        permitData.mailingAddress.provinceCode,
      )
    : null;

  const permitName = await getFromCache(
    cacheManager,
    CacheKey.PERMIT_TYPE,
    permit.permitType,
  );

  return {
    vehicleTypeName,
    vehicleSubTypeName,
    mailingCountryName,
    mailingProvinceName,
    vehicleCountryName,
    vehicleProvinceName,
    permitName,
  };
};

/**
 * Generate Application Number
 * @param applicationSource to get the source code
 * @param permitId if permit id is present then it is a permit amendment
 * and application number will be generated from exisitng permit number.
 * Generates an application number for a new or existing permit application. For an existing permit (amendment),
 * it generates the application number based on the existing permit's number with incremented revision.
 * For a new application, it generates a new sequence and random number.
 * @param dataSource DataSource connection to interact with the database.
 * @param cacheManager Cache manager to retrieve cached data.
 * @param permitApplicationOrigin Origin of the permit application (e.g., online, offline).
 * @param existingPermit Optional. The existing permit, if this is an amendment.
 * @returns A promise that resolves to the generated application number string.
 */
export const generateApplicationNumber = async (
  dataSource: DataSource,
  cacheManager: Cache,
  permitApplicationOrigin: PermitApplicationOriginEnum,
  existingPermit?: Permit,
): Promise<string> => {
  let sequence: string;
  let source;
  let randomNumber;
  let revision = '-A00';
  if (existingPermit) {
    //Format revision id
    revision = `-A${String(existingPermit.revision + 1).padStart(2, '0')}`;
    if (existingPermit.permitNumber) {
      sequence = existingPermit.permitNumber.substring(3, 11);
      randomNumber = existingPermit.permitNumber.substring(12, 15);
    } else {
      throw new InternalServerErrorException('Permit number does not exist');
    }
    // Fetching existing permit source from cache
    source = await getFromCache(
      cacheManager,
      CacheKey.PERMIT_APPLICATION_ORIGIN,
      existingPermit.permitApplicationOrigin,
    );
  } else {
    // Fetching sequence number for new permit application
    sequence = await callDatabaseSequence(
      'permit.ORBC_PERMIT_NUMBER_SEQ',
      dataSource,
    );

    // Generating random number for new permit
    randomNumber = randomInt(100, 1000);

    // Fetching permit application origin source from cache for new permit
    source = await getFromCache(
      cacheManager,
      CacheKey.PERMIT_APPLICATION_ORIGIN,
      permitApplicationOrigin,
    );
  }
  // Compiling application number from source, sequence, random number, and revision
  const applicationNumber = `A${source}-${sequence.padStart(8, '0')}-${randomNumber}${revision}`;

  return applicationNumber;
};

/**
 * Generate permit number for a permit application. This function creates a formatted permit number
 * by combining an approval source ID with a sequence derived from either the permit's number
 * (Amending existing permits) or its application number (for new applications), along with an increment
 * or random set of characters to ensure uniqueness. The approval source is determined by caching or
 * set to a default value if not found.
 * @param cacheManager The cache manager interface for retrieving approval source.
 * @param permit The permit object, which must contain either a permit number (for amendments)
 * or an application number (for new applications).
 * @returns A promise that resolves to the newly generated permit number as a string.
 */
export const generatePermitNumber = async (
  cacheManager: Cache,
  permit: Permit,
): Promise<string> => {
  // Retrieve the approval source from cache. AUTO is hardcoded for release 1
  const approvalSource = await getFromCache(
    cacheManager,
    CacheKey.PERMIT_APPROVAL_SOURCE,
    PermitApprovalSourceEnum.AUTO, //TODO : Hardcoding for release 1
  );
  const approvalSourceId = approvalSource ? +approvalSource : 9; // Assuming 9 is a default value

  let sequence: string;
  let randomNumber: string;
  let revision = ''; // Initialize as empty string

  // Use permitNumber for amendments and applicationNumber for new applications
  if (permit.permitNumber) {
    sequence = permit.permitNumber.substring(3, 11);
    randomNumber = permit.permitNumber.substring(12, 15);
    revision = `-A${String(permit.revision + 1).padStart(2, '0')}`;
  } else {
    sequence = permit.applicationNumber.substring(3, 11);
    randomNumber = permit.applicationNumber.substring(12, 15);
  }

  // Format and return the permit number
  const permitNumber = `P${approvalSourceId}-${sequence}-${randomNumber}${revision}`;
  return permitNumber;
};

/**
 * Determines the appropriate display name for the applicant based on their directory type and the
 * current user's authorization group.
 * - For users from the IDIR directory, it returns the user's username if the current user has the
 *   correct authorization group. Otherwise, it returns a predefined full text constant.
 * - For users from other directories, it returns the user's first and last name, concatenated.
 * @param applicationOwner The user object representing the owner of the application.
 * @param currentUserRole The authorization group of the current user.
 * @returns The display name of the application owner as a string.
 */
export const getApplicantDisplay = (
  applicationOwner: User,
  currentUserRole: UserRole,
): string => {
  if (applicationOwner?.directory === Directory.IDIR) {
    if (doesUserHaveRole(currentUserRole, IDIR_USER_ROLE_LIST)) {
      return applicationOwner?.userName;
    } else {
      return PPC_FULL_TEXT;
    }
  } else {
    const firstName = applicationOwner?.userContact?.firstName ?? '';
    const lastName = applicationOwner?.userContact?.lastName ?? '';
    return (firstName + ' ' + lastName).trim();
  }
};

/**
 * Determines if the given permit application is an amendment.
 * An application is considered an amendment if:
 * - The application status is 'IN_PROGRESS'
 * - The original permit ID is different from the current permit ID
 * - The revision number is greater than 0
 *
 * @param {Permit} permit - The permit object to check.
 * @param {ApplicationStatus} permit.permitStatus - The current status of the permit application.
 * @param {string} permit.originalPermitId - The ID of the original permit.
 * @param {string} permit.permitId - The ID of the current permit.
 * @param {number} permit.revision - The revision number of the permit.
 * @returns {boolean} - Returns true if the application is an amendment, otherwise false.
 */
export const isAmendmentApplication = ({
  permitStatus,
  originalPermitId,
  permitId,
  revision,
}: Permit) => {
  return (
    permitStatus === ApplicationStatus.IN_PROGRESS &&
    originalPermitId !== permitId &&
    revision > 0
  );
};

/**
 * Checks if the given permit type is eligible to be added to a specific processing queue.
 * This method essentially acts as a filter, determining whether the provided permit type
 * exists in a predefined list of types that require additional processing in a queue.

 * @param {PermitType} permitType - The type of the permit being checked.
 * @returns {boolean} - Returns true if the permit type is in the list of types
 * that are eligible for the queue, otherwise returns false.
 */
export const isPermitTypeEligibleForQueue = (
  permitType: PermitType,
): boolean => {
  return PERMIT_TYPES_FOR_QUEUE.includes(permitType);
};

export const validApplicationDates = (
  application: Permit,
  timezone: string,
): boolean => {
  const todayUTC = dayjs(new Date());
  const todayPacific = todayUTC.tz(timezone).format('YYYY-MM-DD');
  const { startDate, expiryDate } = application.permitData;
  return startDate >= todayPacific && startDate <= expiryDate;
};
