import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseEntityFull} from "../template/BaseEntityFull";
import {User} from "../User";

@Entity('payme')
export class Payme extends BaseEntityFull {

    @ManyToOne(() => User, user => user.user_roles)
    @JoinColumn({name: 'user_id'})
    user!: User;

    @Column({name: 'user_id'})
    user_id!: number; // Foreign key sifatida saqlanadi

    @Column({type: 'varchar', length: 255, nullable: true})
    phone_number!: string

    @Column({type: 'varchar', length: 255, nullable: true})
    password!: string

    @Column({type: 'text', nullable: true})
    device_id!: string

    @Column({type: 'text', nullable: true})
    device_key!: string

    @Column({type: 'text', nullable: true})
    device!: string

    @Column({type: 'text', nullable: true})
    session!: string

    @Column({type: 'boolean', nullable: true})
    is_active_session!: boolean

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    payment_amount!: number;


    @Column({type: 'text', nullable: true})
    changed_card_id!: string


}