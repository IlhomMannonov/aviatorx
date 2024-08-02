import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, OneToMany} from "typeorm";
import {Department} from "./Department";


@Entity('module')
export class Module extends BaseEntityFull {
    @Column({type: 'varchar', length: 255,})
    name!: string;

    @OneToMany(() => Department, department => department.module)
    departments!: Department[];

}