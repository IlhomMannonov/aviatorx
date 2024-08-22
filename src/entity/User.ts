import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import {Wallet} from "./Wallet";
import {BaseEntityFull} from "./template/BaseEntityFull";
import {UserRole} from "./UserRole";
import {Country} from "./Country";
import {Currency} from "./Currency";

@Entity('users')
export class User extends BaseEntityFull {


    @Column({type: 'varchar', length: 255, nullable: true})
    first_name!: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    last_name!: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    patron!: string;

    @Column({type: 'varchar', length: 255, unique: true, nullable: true})
    email!: string;

    @Column({type: 'varchar', length: 255, unique: true, nullable: true})
    aviator_id!: string;

    @Column({type: 'varchar', length: 255, unique: true, nullable: true})
    password!: string;

    @Column({type: 'timestamp', nullable: true})
    last_login_time!: Date;

    @Column({type: 'boolean', default: false})
    phone_verified!: boolean;

    @Column({type: 'boolean', default: false})
    email_verified!: boolean;



    @ManyToOne(() => Country)
    @JoinColumn({name: 'country_id'})
    country!: Country;

    @Column({name: 'country_id', nullable: true})
    country_id!: number; // Foreign key sifatida saqlanadi
    @ManyToOne(() => Country)

    @JoinColumn({name: 'currency_id'})
    currency!: Currency;

    @Column({name: 'currency_id', nullable: true})
    currency_id!: number; // Foreign key sifatida saqlanadi


    @Column({type: 'varchar', length: 255, nullable: true})
    chat_id!: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    state!: string;

    @Column({type: 'boolean', default: false})
    is_bot_user!: boolean;

    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets!: Wallet[];

    @OneToMany(() => UserRole, role => role.user)
    user_roles!: UserRole[];

}
