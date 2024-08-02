import {Column, Entity} from "typeorm";
import {BaseEntityFull} from "./template/BaseEntityFull";


@Entity("lang_value")
export class LangValue extends BaseEntityFull {
    @Column({type: 'varchar', length: 255})
    key!: string;

    @Column({type: 'varchar', length: 255})
    value!: string;


}