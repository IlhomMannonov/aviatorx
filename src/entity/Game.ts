import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Module} from "./Module";


@Entity('game')
export class Game extends BaseEntityFull {

    @Column({type: 'varchar', length: 255,})
    name!: string;


    @Column({name: 'game_id', nullable: true})
    game_id!: number;
}