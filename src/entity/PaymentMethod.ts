import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity} from "typeorm";
import {PaymentType} from "./enums/PaymentType";

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

    
}