import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreatePowerUnitTypeDto } from './dto/request/create-power-unit-type.dto';
import { ReadPowerUnitTypeDto } from './dto/response/read-power-unit-type.dto';
import { UpdatePowerUnitTypeDto } from './dto/request/update-power-unit-type.dto';
import { PowerUnitType } from './entities/power-unit-type.entity';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';

@Injectable()
export class PowerUnitTypesService {
  constructor(
    @InjectRepository(PowerUnitType)
    private powerUnitTypeRepository: Repository<PowerUnitType>,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {}

  @LogAsyncMethodExecution()
  async create(
    powerUnitType: CreatePowerUnitTypeDto,
  ): Promise<ReadPowerUnitTypeDto> {
    const newPowerUnitType = this.classMapper.map(
      powerUnitType,
      CreatePowerUnitTypeDto,
      PowerUnitType,
    );
    await this.powerUnitTypeRepository.insert(newPowerUnitType);
    return this.findOne(newPowerUnitType.typeCode);
  }

  @LogAsyncMethodExecution()
  async findAll(): Promise<ReadPowerUnitTypeDto[]> {
    return this.classMapper.mapArrayAsync(
      await this.powerUnitTypeRepository.find({ where: { isActive: '1' } }),
      PowerUnitType,
      ReadPowerUnitTypeDto,
    );
  }

  @LogAsyncMethodExecution()
  async findOne(typeCode: string): Promise<ReadPowerUnitTypeDto> {
    return this.classMapper.mapAsync(
      await this.powerUnitTypeRepository.findOne({
        where: { typeCode },
      }),
      PowerUnitType,
      ReadPowerUnitTypeDto,
    );
  }

  @LogAsyncMethodExecution()
  async update(
    typeCode: string,
    updatePowerUnitTypeDto: UpdatePowerUnitTypeDto,
  ): Promise<ReadPowerUnitTypeDto> {
    const newPowerUnitType = this.classMapper.map(
      updatePowerUnitTypeDto,
      UpdatePowerUnitTypeDto,
      PowerUnitType,
    );

    await this.powerUnitTypeRepository.update({ typeCode }, newPowerUnitType);
    return this.findOne(typeCode);
  }

  @LogAsyncMethodExecution()
  async remove(typeCode: string): Promise<DeleteResult> {
    return await this.powerUnitTypeRepository.delete(typeCode);
  }
}
