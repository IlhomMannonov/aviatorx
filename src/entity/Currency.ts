import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";

@Entity('currency')
export class Currency extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'varchar', length: 255})
    code!: string;



}