import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {PaymentType} from "./enums/PaymentType";
import {Attachment} from "./Attachment";

@Entity('payment_method')
export class PaymentMethod extends BaseEntityFull {
    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'enum', enum: PaymentType})
    type!: PaymentType;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    min!: number;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    max!: number;

    @Column({type: 'text', nullable: true})
    url!: string;
    @Column({ name: 'attachment_id', nullable: true })
    attachment_id!: number; // Foreign key sifatida saqlanadi

    @ManyToOne(() => Attachment)
    @JoinColumn({ name: 'attachment_id' }) // attachment_id ni foreign key sifatida belgilaydi
    attachment!: Attachment;

}