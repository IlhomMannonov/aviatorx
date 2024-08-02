import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('static_options')
export class StaticOption {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    key!: string;

    @Column({type: 'varchar', length: 255})
    value!: string;
}