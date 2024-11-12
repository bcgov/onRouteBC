import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from 'src/modules/common/entities/base.entity';
import { LoaDetail } from 'src/modules/special-auth/entities/loa-detail.entity';

@Entity({ name: 'permit.ORBC_PERMIT_LOA' })
export class PermitLoa extends Base {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'PERMIT_LOA_ID' })
  permitLoaId: number;

  @AutoMap(() => LoaDetail)
  @OneToOne(() => LoaDetail, (LoaDetail) => LoaDetail.loaId)
  @JoinColumn({ name: 'LOA_ID' })
  loa: LoaDetail;

  @AutoMap()
  @Column({
    type: 'bigint',
    name: 'PERMIT_ID',
  })
  permitId: string;
}
