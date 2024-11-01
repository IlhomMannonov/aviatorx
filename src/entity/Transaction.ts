import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";
import {User} from "./User";
import {Wallet} from "./Wallet";

@Entity('transactions')
export class Transaction extends BaseEntityFull {


    @ManyToOne(() => User, user => user.id)
    @JoinColumn({name: 'user_id'})
    user!: User;

    @Column({name: 'user_id'})
    user_id!: number; // Foreign key sifatida saqlanadi


    @ManyToOne(() => Wallet, wallet => wallet.id)
    @JoinColumn({name: 'wallet_id'})
    wallet!: Wallet;

    @Column({name: 'wallet_id'})
    wallet_id!: number; // Foreign key sifatida saqlanadi

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    amount!: number;

    @Column({type: 'text'})
    desc!: string;

    @Column({type: 'varchar',length: 255})
    platform!: string;

    @Column({type: 'varchar',length: 255})
    category!: string;

    @Column({type: 'varchar',length: 255})
    card_number!: string;





}