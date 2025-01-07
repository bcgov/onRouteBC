import { ReadLoaDto } from 'src/modules/special-auth/dto/response/read-loa.dto';
import { PermitType } from '../enum/permit-type.enum';
import { Loas, PermitData } from '../interface/permit.template.interface';
import { Permit } from 'src/modules/permit-application-payment/permit/entities/permit.entity';
import * as dayjs from 'dayjs';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { In, QueryRunner } from 'typeorm';
import { LoaDetail } from 'src/modules/special-auth/entities/loa-detail.entity';
import { Mapper } from '@automapper/core';
import { UnprocessableEntityException } from '@nestjs/common';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
export const isVehicleTypeValid = (
  permitVehicleType: string,
  permitVehicleId: string,
  powerUnits?: string[],
  trailers?: string[],
): boolean => {
  const isPowerUnitAllowed =
    permitVehicleType === 'powerUnit'
      ? powerUnits.includes(permitVehicleId)
      : true;

  const isTrailerAllowed =
    permitVehicleType === 'trailer' ? trailers.includes(permitVehicleId) : true;

  return isPowerUnitAllowed && isTrailerAllowed;
};

export const isPermitTypeValid = (
  permitTypePermit: PermitType,
  permitType: PermitType[],
): boolean => {
  return permitType.includes(permitTypePermit);
};

export const isValidDateForLoa = (
  loaDetail: Loas | ReadLoaDto,
  permit: Permit,
): boolean => {
  const { startDate, expiryDate } = loaDetail;
  const { startDate: permitStartDate, expiryDate: permitExpiryDate } =
    permit.permitData;
  return (
    isStartDateValid(startDate, permitStartDate) &&
    isEndDateValid(expiryDate, permitExpiryDate)
  );
};

export const isStartDateValid = (
  startDate: string,
  permitStartDate: string,
): boolean => {
  return dayjs(startDate).isSameOrBefore(permitStartDate, 'day');
};

export const isEndDateValid = (
  expiryDate: string,
  permitExpiryDate: string,
): boolean => {
  return expiryDate
    ? dayjs(expiryDate).isSameOrAfter(permitExpiryDate, 'day')
    : true;
};
export const isValidLoa = async (
  permit: Permit,
  queryRunner: QueryRunner,
  mapper: Mapper,
) => {
  const permitData = JSON.parse(permit.permitData.permitData) as PermitData;
  if (permitData.loas) {
    const { vehicleId: permitVehicleId, vehicleType: permitVehicleType } =
      permitData.vehicleDetails;
    const { companyId } = permit.company;
    const loaNumbers = permitData.loas.map((loa) => loa.loaNumber);
    const readLoaDto = await findLoas(
      companyId,
      loaNumbers,
      queryRunner,
      mapper,
    );

    // Validate LOA details and permit data against database entries
    validateLoaDetails(readLoaDto, permit, permitVehicleId, permitVehicleType);

    // validate LoA snapshot in permit Data
    validatePermitDataAgainstLoas(
      permitData,
      permit,
      permitVehicleId,
      permitVehicleType,
    );
  }
};
export const validateLoaDetails = (
  readLoaDtos: ReadLoaDto[],
  permit: Permit,
  permitVehicleId: string,
  permitVehicleType: string,
) => {
  for (const readLoaDto of readLoaDtos) {
    const {
      powerUnits: loaPowerUnits,
      trailers: loaTrailers,
      loaPermitType: loaPermitTypes,
    } = readLoaDto;
    if (!isValidDateForLoa(readLoaDto, permit)) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${readLoaDto.loaNumber} with invalid date(s).`,
      );
    }
    if (
      !isVehicleTypeValid(
        permitVehicleType,
        permitVehicleId,
        loaPowerUnits,
        loaTrailers,
      )
    ) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${readLoaDto.loaNumber} with invalid vehicle(s).`,
      );
    }
    if (!isPermitTypeValid(permit.permitType, loaPermitTypes)) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${readLoaDto.loaNumber} with invalid permitType.`,
      );
    }
  }
};

export const validatePermitDataAgainstLoas = (
  permitData: PermitData,
  permit: Permit,
  permitVehicleId: string,
  permitVehicleType: string,
) => {
  for (const loa of permitData.loas) {
    const permitLoaPowerUnits = loa.powerUnits;
    const permitLoaTrailers = loa.trailers;
    const permitTypesLoa = loa.loaPermitType;
    if (!isValidDateForLoa(loa, permit)) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${loa.loaNumber} snapshot with invalid date(s).`,
      );
    }

    if (
      !isVehicleTypeValid(
        permitVehicleType,
        permitVehicleId,
        permitLoaPowerUnits,
        permitLoaTrailers,
      )
    ) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${loa.loaNumber}  snapshot with invalid vehicle(s).`,
      );
    }
    if (!isPermitTypeValid(permit.permitType, permitTypesLoa)) {
      throw new UnprocessableEntityException(
        `${permit.applicationNumber} has LoA ${loa.loaNumber} snapshot with invalid permitType.`,
      );
    }
  }
};

/**
 * Retrieves a single LOA (Letter of Authorization) detail for a specified company.
 *
 * Steps:
 * 1. Fetches the LOA detail from the repository based on company ID and LOA Number.
 * 2. Ensures the fetched LOA detail is active.
 * 3. Includes relations (company, loaVehicles, loaPermitTypes) in the query.
 *
 * @param {number} companyId - ID of the company for which to fetch the LOA detail.
 * @param {number} loaNumber - Number of the LOA to be fetched.
 * @returns {Promise<LoaDetail>} - Returns a Promise that resolves to the LOA detail.
 */
export const findLoas = async (
  companyId: number,
  loaNumbers: number[],
  queryRunner: QueryRunner,
  mapper: Mapper,
): Promise<ReadLoaDto[]> => {
  // Fetch initial active LOA details
  const loaDetails = await queryRunner.manager.find(LoaDetail, {
    where: {
      loaNumber: In(loaNumbers),
      isActive: true,
      company: { companyId },
    },
    relations: ['company', 'loaVehicles', 'loaPermitTypes'],
  });
  const readLoaDto = await mapper.mapArrayAsync(
    loaDetails,
    LoaDetail,
    ReadLoaDto,
    {
      extraArgs: () => ({ companyId: companyId }),
    },
  );
  return readLoaDto;
};
