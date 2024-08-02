import {Column, Entity} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";

@Entity('country')
export class Country extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'varchar', length: 255})
    flag!: string;



}