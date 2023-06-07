import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermitDto } from './dto/request/create-permit.dto';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { Permit } from './entities/permit.entity';
import { PermitType } from './entities/permit-type.entity';
import { PdfService } from '../pdf/pdf.service';
import { DmsResponse } from 'src/common/interface/dms.interface';
import { DownloadMode } from 'src/common/enum/pdf.enum';

@Injectable()
export class PermitService {
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    @InjectRepository(PermitType)
    private permitTypeRepository: Repository<PermitType>,
    private readonly pdfService: PdfService,
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
    return await this.permitRepository.findOne({
      where: { permitId: permitId },
      relations: {
        permitData: true,
      },
    });
  }

  public async findAllPermitTypes(): Promise<PermitType[]> {
    return await this.permitTypeRepository.find({});
  }

  /**
   * Finds a PDF document associated with a specific permit ID.
   * @param access_token - The access token for authorization.
   * @param permitId - The ID of the permit for which to find the PDF document.
   * @param downloadMode - The mode for downloading the document (optional).
   * @returns A Promise resolving to a DmsResponse object representing the found PDF document.
   */
  public async findPDFbyPermitId(
    access_token: string,
    permitId: string,
    downloadMode?: DownloadMode,
  ): Promise<DmsResponse> {
    // Retrieve the permit details using the permit ID
    const permit = await this.findOne(permitId);
    // Find the PDF document based on the associated document ID
    const response = await this.pdfService.findPDFbyDocumentId(
      access_token,
      permit.documentId,
      downloadMode,
    );
    // Set the file name of the response to the permit permit number
    response.fileName = permit.applicationNumber; // TODO: change to permit number
    return response;
  }
}
