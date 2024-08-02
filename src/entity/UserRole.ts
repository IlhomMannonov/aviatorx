import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {User} from "./User";
import {Role} from "./Role";


@Entity('user_role')
export class UserRole extends BaseEntityFull {

    @ManyToOne(() => User, user => user.user_roles)
    @JoinColumn({name: 'user_id'})
    user!: User;

    @Column({name: 'user_id'})
    user_id!: number; // Foreign key sifatida saqlanadi

    @ManyToOne(() => Role, role => role.user_roles)
    @JoinColumn({name: 'role_id'})
    role!: Role;

    @Column({name: 'role_id'})
    role_id!: number;
}