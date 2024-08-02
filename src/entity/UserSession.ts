import {Column, Entity} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";

@Entity('user_session')
export class StaticOption extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    device_name!: string;

    @Column({type: 'varchar', length: 255})
    device_type!: string; //ios, android


    @Column({type: 'varchar', length: 255})
    ip_address!: string;

}