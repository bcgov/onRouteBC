import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, UpdateResult } from 'typeorm';
import { CreatePermitDto } from './dto/request/create-permit.dto';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { Permit } from './entities/permit.entity';
import { PermitType } from './entities/permit-type.entity';
import { DopsService } from '../common/dops.service';
import { FileDownloadModes } from '../../common/enum/file-download-modes.enum';
import { IUserJWT } from '../../common/interface/user-jwt.interface';
import { Response } from 'express';
import { ReadFileDto } from '../common/dto/response/read-file.dto';
import { PermitStatus } from 'src/common/enum/permit-status.enum';
import { Receipt } from '../payment/entities/receipt.entity';
import {
  IPaginationMeta,
  IPaginationOptions,
} from 'src/common/interface/pagination.interface';
import { PaginationDto } from 'src/common/class/pagination';
import { paginate } from 'src/common/helper/paginate';
import { PermitHistoryDto } from './dto/response/permit-history.dto';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { ApplicationService } from './application.service';

@Injectable()
export class PermitService {
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    @InjectRepository(PermitType)
    private permitTypeRepository: Repository<PermitType>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    private readonly dopsService: DopsService,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) {}

  async create(createPermitDto: CreatePermitDto): Promise<ReadPermitDto> {
    const permitEntity = await this.classMapper.mapAsync(
      createPermitDto,
      CreatePermitDto,
      Permit,
    );

    const savedPermitEntity = await this.permitRepository.save(permitEntity);

    const refreshedPermitEntity = await this.findOne(
      savedPermitEntity.permitId,
    );

    const readPermitDto = await this.classMapper.mapAsync(
      refreshedPermitEntity,
      Permit,
      ReadPermitDto,
    );

    return readPermitDto;
  }

  private async findOne(permitId: string): Promise<Permit> {
    return this.permitRepository.findOne({
      where: { permitId: permitId },
      relations: {
        permitData: true,
      },
    });
  }

  private async findOneWithTransactions(permitId: string): Promise<Permit> {
    return this.permitRepository.findOne({
      where: { permitId: permitId },
      relations: {
        transactions: true,
      },
    });
  }

  /**
   * Finds permits by permit number.
   * @param permitNumber partial or full permit number to search
   * @returns an array of permits
   */
  public async findByPermitNumber(
    permitNumber: string,
  ): Promise<ReadPermitDto[]> {
    const permits = await this.permitRepository.find({
      where: { permitNumber: Like(`%${permitNumber}%`) },
    });
    return this.classMapper.mapArrayAsync(permits, Permit, ReadPermitDto);
  }

  public async findAllPermitTypes(): Promise<PermitType[]> {
    return this.permitTypeRepository.find({});
  }

  /**
   * Finds a PDF document associated with a specific permit ID.
   * @param currentUser - The current User Details.
   * @param permitId - The ID of the permit for which to find the PDF document.
   * @param downloadMode - The mode for downloading the document (optional).
   * @returns A Promise resolving to a ReadFileDto object representing the found PDF document.
   */
  public async findPDFbyPermitId(
    currentUser: IUserJWT,
    permitId: string,
    downloadMode: FileDownloadModes,
    res?: Response,
  ): Promise<ReadFileDto> {
    // Retrieve the permit details using the permit ID
    const permit = await this.findOne(permitId);

    let file: ReadFileDto = null;
    if (downloadMode === FileDownloadModes.PROXY) {
      await this.dopsService.download(
        currentUser,
        permit.documentId,
        downloadMode,
        res,
        permit.companyId,
      );
    } else {
      file = (await this.dopsService.download(
        currentUser,
        permit.documentId,
        downloadMode,
        res,
        permit.companyId,
      )) as ReadFileDto;
    }
    return file;
  }

  async findPermit(
    options: IPaginationOptions,
    searchColumn: string,
    searchString: string,
  ): Promise<PaginationDto<ReadPermitDto, IPaginationMeta>> {
    const permits = this.permitRepository
      .createQueryBuilder('permit')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .where('permit.permitNumber IS NOT NULL');
    if (searchColumn.toLowerCase() === 'plate') {
      permits.andWhere(
        `JSON_VALUE(permitData.permitData, '$.vehicleDetails.plate') like '%${searchString}%'`,
      );
    }
    if (searchColumn.toLowerCase() === 'permitnumber') {
      permits.andWhere(`permit.permitNumber like '%${searchString}%'`);
    }
    if (searchColumn.toLowerCase() === 'clientnumber') {
      permits.andWhere(
        `JSON_VALUE(permitData.permitData, '$.clientNumber') like '%${searchString}%'`,
      );
    }
    if (searchColumn.toLowerCase() === 'companyname') {
      permits.andWhere(
        `JSON_VALUE(permitData.permitData, '$.companyName') like '%${searchString}%'`,
      );
    }
    if (searchColumn.toLowerCase() === 'applicationnumber') {
      permits.andWhere(`permit.applicationNumber like '%${searchString}%'`);
    }
    const permit: PaginationDto<Permit, IPaginationMeta> = await paginate(
      permits,
      options,
    );
    const readPermitDto: ReadPermitDto[] = await this.classMapper.mapArrayAsync(
      permit.items,
      Permit,
      ReadPermitDto,
    );
    const readPermitDtoItems: PaginationDto<ReadPermitDto, IPaginationMeta> =
      new PaginationDto<ReadPermitDto, IPaginationMeta>(
        readPermitDto,
        permit.meta,
      );
    return readPermitDtoItems;
  }

  /**
   * Finds permits for user.
   * @param userGUID if present get permits for this user
   *  @param companyId if present get permits for this company
   * @param expired if true get expired premits else get active permits
   *
   */
  public async findUserPermit(
    options: IPaginationOptions,
    userGUID: string,
    companyId: number,
    expired: string,
  ): Promise<PaginationDto<ReadPermitDto, IPaginationMeta>> {
    const permits = this.permitRepository
      .createQueryBuilder('permit')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .where('permit.permitNumber IS NOT NULL')
      .andWhere('permit.companyId = :companyId', {
        companyId: companyId,
      })
      .andWhere(userGUID ? 'permit.userGuid = :userGUID' : '1=1', {
        userGUID: userGUID,
      })
      .andWhere(
        expired === 'true'
          ? '(permit.permitStatus IN (:...expiredStatus)OR(permit.permitStatus = :activeStatus AND permitData.expiryDate < :expiryDate))'
          : '(permit.permitStatus = :activeStatus AND permitData.expiryDate >= :expiryDate)',
        {
          expiredStatus: Object.values(PermitStatus).filter(
            (x) => x != PermitStatus.ISSUED && x != PermitStatus.SUPERSEDED,
          ),
          activeStatus: PermitStatus.ISSUED,
          expiryDate: new Date(),
        },
      );

    const permit: PaginationDto<Permit, IPaginationMeta> = await paginate(
      permits,
      options,
    );
    const readPermitDto: ReadPermitDto[] = await this.classMapper.mapArrayAsync(
      permit.items,
      Permit,
      ReadPermitDto,
    );
    const readPermitDtoItems: PaginationDto<ReadPermitDto, IPaginationMeta> =
      new PaginationDto<ReadPermitDto, IPaginationMeta>(
        readPermitDto,
        permit.meta,
      );
    return readPermitDtoItems;
  }

  async findReceipt(permit: Permit): Promise<Receipt> {
    if (!permit.transactions || permit.transactions.length === 0) {
      throw new Error('No transactions associated with this permit');
    }

    // Find the latest transaction for the permit, but not necessarily an approved transaction
    let latestTransaction = permit.transactions[0];
    let latestSubmitDate = latestTransaction.transactionSubmitDate;
    permit.transactions.forEach((transaction) => {
      if (
        new Date(transaction.transactionSubmitDate) >=
        new Date(latestSubmitDate)
      ) {
        latestSubmitDate = transaction.transactionSubmitDate;
        latestTransaction = transaction;
      }
    });

    const receipt = await this.receiptRepository.findOne({
      where: {
        transactionId: latestTransaction.transactionId,
      },
    });

    if (!receipt) {
      throw new Error(
        "No receipt generated for this permit's latest transaction",
      );
    }
    return receipt;
  }

  /**
   * Finds a receipt PDF document associated with a specific permit ID.
   * @param currentUser - The current User Details.
   * @param permitId - The ID of the permit for which to find the receipt PDF document.
   * @returns A Promise resolving to a ReadFileDto object representing the found PDF document.
   */
  public async findReceiptPDF(
    currentUser: IUserJWT,
    permitId: string,
    res?: Response,
  ): Promise<ReadFileDto> {
    const permit = await this.findOneWithTransactions(permitId);
    const receipt = await this.findReceipt(permit);

    const file: ReadFileDto = null;
    await this.dopsService.download(
      currentUser,
      receipt.receiptDocumentId,
      FileDownloadModes.PROXY,
      res,
      permit.companyId,
    );
    return file;
  }

  public async findPermitHistory(
    originalPermitId: string,
  ): Promise<PermitHistoryDto[]> {
    const permits = await this.permitRepository
      .createQueryBuilder('permit')
      .innerJoinAndSelect('permit.transactions', 'transaction')
      .where('permit.permitNumber IS NOT NULL')
      .andWhere('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      })
      .getMany();
    return this.classMapper.mapArrayAsync(permits, Permit, PermitHistoryDto);
  }

  /**
   *
   * @param permitId ex: 1
   * @param status ex: VOIDED|REVOKED
   * Description: This method will update the permit status for given permit id and will set it to either REVOKED or VOIDED stauts.
   */
  public async voidPermit(
    permitId: string,
    status: ApplicationStatus.REVOKED | ApplicationStatus.VOIDED,
    currentUser: IUserJWT,
  ): Promise<UpdateResult> {
    const permit = await this.findOne(permitId);
    if (!permit)
      throw new NotFoundException('Permit id ' + permitId + ' not found.');
    if (permit.permitStatus != ApplicationStatus.ISSUED)
      throw new InternalServerErrorException(
        'Cannot void a permit in ' + permit.permitStatus + ' status',
      );
    const applicationCount = 0;
    await this.applicationService.checkApplicationInProgress(
      permit.originalPermitId,
    );
    if (applicationCount > 0) {
      throw new InternalServerErrorException(
        'An application exists for this permit. Please cancel application before voiding permit.',
      );
    }
    permit.permitStatus = ApplicationStatus.SUPERSEDED;
    // to create new permit
    let newPermit = permit;
    newPermit.permitId = null;
    newPermit.permitStatus = status;
    newPermit.revision = permit.revision + 1;
    newPermit.previousRevision = +permitId;
    const applicationNumber =
      await this.applicationService.generateApplicationNumber(
        currentUser.identity_provider,
        permitId,
      );
    newPermit.applicationNumber = applicationNumber;
    /* Create application to generate permit id. 
    this permit id will be used to generate permit number based this id's application number.*/
    newPermit = await this.permitRepository.save(newPermit);
    const permitNumber = await this.applicationService.generatePermitNumber(
      newPermit.permitId,
    );
    newPermit.permitNumber = permitNumber;
    // Save new permit
    const updateNewPermit = await this.permitRepository
      .createQueryBuilder()
      .update()
      .set({ permitStatus: status })
      .where('permitId = :permitId', { permitId: newPermit.permitId })
      .execute();
    //Update old permit status to SUPERSEDED.
    await this.permitRepository
      .createQueryBuilder()
      .update()
      .set({ permitStatus: ApplicationStatus.SUPERSEDED })
      .where('permitId = :permitId', { permitId: permitId })
      .execute();
    return updateNewPermit;
  }
}
