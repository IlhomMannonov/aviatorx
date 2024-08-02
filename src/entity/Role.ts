import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, OneToMany} from "typeorm";
import {UserRole} from "./UserRole";

@Entity('role')
export class Role extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;

    @OneToMany(() => Role, role => role.user_roles)
    user_roles!: UserRole[];
}