import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Module} from "./Module";
import {Role} from "./Role";


@Entity('department')
export class Department extends BaseEntityFull {

    @Column({type: 'varchar', length: 255,})
    name!: string;

    @ManyToOne(() => Module, department => department.departments)
    @JoinColumn({name: 'module_id'})
    module!: Module;

    @Column({name: 'module_id'})
    module_id!: number;
}