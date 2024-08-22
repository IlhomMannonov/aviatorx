import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {Request, Response} from "express";

const userRepository = AppDataSource.getRepository(User);


export const player_info = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
};