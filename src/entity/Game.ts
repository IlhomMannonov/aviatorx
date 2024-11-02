import {BaseEntityFull} from "./template/BaseEntityFull";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Attachment} from "./Attachment";


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


    @Column({ name: 'attachment_id', nullable: true })
    attachment_id!: number; // Foreign key sifatida saqlanadi

    @ManyToOne(() => Attachment)
    @JoinColumn({ name: 'attachment_id' }) // attachment_id ni foreign key sifatida belgilaydi
    attachment!: Attachment;



}