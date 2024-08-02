import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('permission')
export class Permission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    name!: string;


}