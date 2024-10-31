import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {User} from './User';
import {BaseEntityFull} from "./template/BaseEntityFull";
import {Currency} from "./Currency";

@Entity('wallet')
export class Wallet extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    amount!: number;

    @ManyToOne(() => User, user => user.wallets)
    @JoinColumn({name: 'user_id'})
    user!: User;

    @Column({name: 'user_id'})
    user_id!: number; // Foreign key sifatida saqlanadi

    @ManyToOne(() => Currency)
    @JoinColumn({name: 'currency_id'})
    currency!: Currency;


    @Column({name: 'currency_id'})
    currency_id!: number;


    @Column({name: 'is_demo', nullable: true})
    is_demo!: boolean;


    @Column({name: 'is_current', default: false})
    is_current!: boolean;

}