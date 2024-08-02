import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('verification_code')
export class VerificationCode {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    code!: string;

    @Column({type: 'varchar', length: 255})
    phone_number!: string;

    @Column({type: 'boolean'})
    is_verified!: boolean;

}