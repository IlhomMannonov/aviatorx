import {Column, Entity} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";

@Entity('lang')
export class Lang extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;
}