import { LogAsyncMethodExecution } from 'src/common/decorator/log-async-method-execution.decorator';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Repository } from 'typeorm';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { SpecialAuth } from './entities/special-auth.entity';
import { ReadSpecialAuthDto } from './dto/response/read-special-auth.dto';
import { Company } from '../company-user-management/company/entities/company.entity';
import { Nullable } from '../../common/types/common';
import { NoFeeType } from '../../common/enum/no-fee-type.enum';

export class SpecialAuthService {
  private readonly logger = new Logger(SpecialAuthService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(SpecialAuth)
    private specialAuthRepository: Repository<SpecialAuth>,
  ) {}

  /**
   * Finds a special authorization by company ID.
   *
   * This method retrieves a special authorization entity from the database based on the provided company ID.
   *
   * @param companyId - The ID of the company for which to find the special authorization.
   *
   * @returns  {Promise<SpecialAuth>} A Promise that resolves to a `SpecialAuth` object representing the special authorization details.
   *
   * @throws Will throw an error if the special authorization cannot be found.
   */
  @LogAsyncMethodExecution()
  async findOne(companyId: number): Promise<SpecialAuth> {
    const specialAuthEntity = await this.specialAuthRepository.findOne({
      where: {
        company: { companyId: companyId },
      },
      relations: ['company'],
    });

    return specialAuthEntity;
  }

  /**
   * Finds a special authorization by company ID.
   *
   * This method retrieves a special authorization entity from the database based on the provided company ID.
   * It then maps the retrieved entity to a Data Transfer Object (DTO) for further processing or response.
   *
   * @param companyId - The ID of the company for which to find the special authorization.
   *
   * @returns {Promise<ReadSpecialAuthDto>} A Promise that resolves to a `ReadSpecialAuthDto` object representing the special authorization details.
   *
   * @throws Will throw an error if the special authorization cannot be found or if mapping fails.
   */
  @LogAsyncMethodExecution()
  async findOneDto(companyId: number): Promise<ReadSpecialAuthDto> {
    const specialAuthEntity = await this.findOne(companyId);
    const readSpecialAuthDto = await this.classMapper.mapAsync(
      specialAuthEntity,
      SpecialAuth,
      ReadSpecialAuthDto,
    );
    return readSpecialAuthDto;
  }

  /**
   * Creates or updates a special authorization based on the provided data.
   *
   * This method performs an upsert operation for special authorization. It first attempts to find an existing special authorization
   * using the provided `companyId`. If found, it updates the existing record; if not, it creates a new special authorization.
   *
   * @param companyId - The ID of the company for which to create or update the special authorization.
   * @param currentUser - The current user performing the operation.
   * @param isLcvAllowed - Boolean flag indicating if LCV is allowed.
   * @param noFeeType - The type of no-fee authorization.
   *
   * @returns {Promise<ReadSpecialAuthDto>} A Promise that resolves to a `ReadSpecialAuthDto` object representing the newly created or updated special authorization.
   *
   * @throws Will throw an error if the special authorization cannot be found or saved, or if mapping fails.
   */
  @LogAsyncMethodExecution()
  async upsertSpecialAuth({
    currentUser,
    companyId,
    isLcvAllowed,
    noFeeType,
  }: {
    currentUser: IUserJWT;
    companyId: number;
    isLcvAllowed?: Nullable<boolean>;
    noFeeType?: Nullable<NoFeeType>;
  }): Promise<ReadSpecialAuthDto> {
    let specialAuth = await this.findOne(companyId);
    const commonFields = {
      isLcvAllowed: isLcvAllowed,
      noFeeType: noFeeType,
      updatedUser: currentUser.userName,
      updatedUserGuid: currentUser.userGUID,
      updatedDateTime: new Date(),
      updatedUserDirectory: currentUser.orbcUserDirectory,
    };

    if (specialAuth) {
      Object.assign(specialAuth, commonFields);
    } else {
      specialAuth = new SpecialAuth();
      specialAuth.company = new Company();
      Object.assign(specialAuth, {
        ...commonFields,
        company: { companyId: companyId },
        createdUser: currentUser.userName,
        createdUserGuid: currentUser.userGUID,
        createdDateTime: new Date(),
        createdUserDirectory: currentUser.orbcUserDirectory,
      });
    }

    specialAuth = await this.specialAuthRepository.save(specialAuth);

    return await this.classMapper.mapAsync(
      specialAuth,
      SpecialAuth,
      ReadSpecialAuthDto,
    );
  }

  async findNoFee(companyId: number): Promise<boolean> {
    const specialAuth = await this.specialAuthRepository
      .createQueryBuilder('specialAuth')
      .innerJoinAndSelect('specialAuth.company', 'company')
      .where('company.companyId = :companyId', { companyId: companyId })
      .getOne();
    return !!specialAuth && !!specialAuth.noFeeType;
  }
}
