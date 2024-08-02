import {Request, Response} from "express";
import {AppDataSource} from "../../config/db";
import {Currency} from "../../entity/Currency";
import {Country} from "../../entity/Country";

const currencyRepository = AppDataSource.getRepository(Currency);
const countryRepository = AppDataSource.getRepository(Country);


export const getActiveAllCurrency = async (req: Request, res: Response): Promise<void> => {
    const activeCurrency = await currencyRepository.find({where: {status: 'active'}, select: ["id", "name", "code"]})
    res.json(activeCurrency)
};

export const activeCountry = async (req: Request, res: Response): Promise<void> => {
    const activeCountry = await countryRepository.find({where: {status: 'active'}, select: ["id", "name","flag"]})
    res.json(activeCountry)
}
