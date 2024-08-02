import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {Request, Response} from "express";
import axios from 'axios';

const userRepository = AppDataSource.getRepository(User);


export const sports = async (req: Request, res: Response): Promise<void> => {
    const url = "https://api.sportmonks.com/v3/my/leagues?api_token=rp4padeOGfH6hwXeR5MWyEE5jq1hLVCaL68GZcyb3dzvxfZDEGrFUBliMvde&include=";

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sports data' });
    }
};