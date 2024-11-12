import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from 'src/modules/common/entities/base.entity';
import { LoaPermitType } from './loa-permit-type-details.entity';
import { LoaVehicle } from './loa-vehicles.entity';
import { IsOptional } from 'class-validator';
import { Company } from 'src/modules/company-user-management/company/entities/company.entity';

@Entity({ name: 'permit.ORBC_LOA_DETAILS' })
export class LoaDetail extends Base {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'LOA_ID' })
  loaId: number;

  @AutoMap()
  @Column({ type: 'int', name: 'LOA_NUMBER', nullable: false })
  loaNumber: number;

  @AutoMap()
  @ManyToOne(() => Company, { eager: true, cascade: false })
  @JoinColumn({ name: 'COMPANY_ID' })
  company: Company;

  @AutoMap()
  @Column({
    name: 'START_DATE',
    nullable: false,
  })
  startDate: Date;

  @AutoMap()
  @IsOptional()
  @Column({
    name: 'EXPIRY_DATE',
    nullable: true,
  })
  expiryDate?: Date;

  @AutoMap()
  @IsOptional()
  @Column({
    name: 'DOCUMENT_ID',
    nullable: true,
  })
  documentId?: string;

  @AutoMap()
  @IsOptional()
  @Column({
    length: '4000',
    name: 'COMMENT',
    nullable: true,
  })
  comment?: string;

  @AutoMap()
  @Column({
    type: 'char',
    name: 'IS_ACTIVE',
    nullable: false,
    default: true,
    transformer: {
      to: (value: boolean): string => (value ? 'Y' : 'N'), // Converts the boolean value to 'Y' or 'N' for storage.
      from: (value: string): boolean => value === 'Y', // Converts the stored string back to a boolean.
    },
  })
  isActive: boolean;

  @AutoMap()
  @Column({ type: 'int', name: 'PREVIOUS_LOA_ID', nullable: true })
  previousLoaId: number;

  @AutoMap()
  @Column({ type: 'int', name: 'ORIGINAL_LOA_ID' })
  originalLoaId: number;

  @AutoMap(() => LoaPermitType)
  @OneToMany(() => LoaPermitType, (LoaPermitType) => LoaPermitType.loa, {
    cascade: true,
  })
  loaPermitTypes: LoaPermitType[];

  @AutoMap(() => LoaVehicle)
  @OneToMany(() => LoaVehicle, (LoaVehicle) => LoaVehicle.loa, {
    cascade: true,
  })
  loaVehicles: LoaVehicle[];
}
