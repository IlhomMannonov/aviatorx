import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity} from "typeorm";


@Entity('game')
export class Game extends BaseEntityFull {

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'text', nullable: true})
    url!: string;


    @Column({name: 'game_id', nullable: true})
    game_id!: number;

    @Column({name: 'img_url', nullable: true})
    img_url!: string;




}