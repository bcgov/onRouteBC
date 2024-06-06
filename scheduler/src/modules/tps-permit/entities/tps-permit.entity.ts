import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { S3uploadStatus } from '../../common/enum/s3-upload-status.enum';

@Entity({ name: 'tps.ORBC_TPS_MIGRATED_PERMITS' })
export class TpsPermit {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for tps migrated permit.',
  })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'MIGRATION_ID' })
  migrationId: number;

  @AutoMap()
  @ApiProperty({
    example: 'P2-00000002-120',
    description: 'Unique formatted tps compliant permit number.',
  })
  @Column({
    length: '19',
    name: 'PERMIT_NUMBER',
    nullable: true,
  })
  permitNumber: string;

  @AutoMap()
  @ApiProperty({
    example: 'P2-00000002-120',
    description: 'Unique formatted orbc compliant permit number.',
  })
  @Column({
    length: '19',
    name: 'NEW_PERMIT_NUMBER',
    nullable: true,
  })
  newPermitNumber: string;

  @AutoMap()
  @ApiProperty({
    example: 0,
    description: 'S3 upload status of a permit pdf.',
  })
  @Column({
    name: 'RETRY_COUNT',
    nullable: true,
  })
  retryCount: number;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Represents the revision number for a permit.',
  })
  @Column({ type: 'integer', name: 'PERMIT_GENERATION' })
  revision: number;

  @AutoMap()
  @ApiProperty({
    example: 'Processed',
    description: 'S3 upload status of a permit pdf.',
  })
  @Column({
    length: 20,
    name: 'S3_UPLOAD_STATUS',
    nullable: true,
  })
  s3UploadStatus: S3uploadStatus;

  @AutoMap()
  @ApiProperty({
    description: 'TPS permit pdf.',
  })
  @Column({
    name: 'PDF',
    nullable: true,
  })
  pdf: Buffer;

  @AutoMap()
  @ApiProperty({
    example: 'dbo',
    description: 'Permit Last Updated User ID ',
  })
  @Column({
    name: 'DB_LAST_UPDATE_USERID',
  })
  lastUpdateUser: string;

  @AutoMap()
  @ApiProperty({
    example: '2023-07-13T17:31:17.470Z',
    description: 'Permit Last Updated Date ',
  })
  @Column({
    name: 'DB_LAST_UPDATE_TIMESTAMP',
  })
  lastUpdateTimestamp: Date;
}
