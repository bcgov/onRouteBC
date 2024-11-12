import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity({ name: 'permit.ORBC_PAYMENT_METHOD_TYPE' })
export class PaymentMethodType {
  @AutoMap()
  @PrimaryColumn({ name: 'PAYMENT_METHOD_TYPE', length: 20, nullable: false })
  paymentMethodTypeCode: string;

  @AutoMap()
  @Column({ name: 'NAME', nullable: false, length: 20 })
  name: string;

  @AutoMap()
  @Column({ name: 'DESCRIPTION', nullable: true, length: 50 })
  description: string;

  @AutoMap()
  @Column({ name: 'GL_PROJ_CODE', nullable: true, length: 7 })
  glProjCode: string;
}
