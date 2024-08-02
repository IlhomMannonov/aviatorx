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
    password!: string;

    @Column({type: 'timestamp'})
    last_login_time!: Date;

    @Column({type: 'boolean', default: false})
    phone_verified!: boolean;

    @Column({type: 'boolean', default: false})
    email_verified!: boolean;


    @ManyToOne(() => Country)
    @JoinColumn({name: 'country_id'})
    country!: Country;

    @Column({name: 'country_id'})
    country_id!: number; // Foreign key sifatida saqlanadi
    @ManyToOne(() => Country)

    @JoinColumn({name: 'currency_id'})
    currency!: Currency;

    @Column({name: 'currency_id'})
    currency_id!: number; // Foreign key sifatida saqlanadi

    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets!: Wallet[];

    @OneToMany(() => UserRole, role => role.user)
    user_roles!: UserRole[];

}
