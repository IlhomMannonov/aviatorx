import {NextFunction, Request, Response} from "express";
import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {Country} from "../../entity/Country";
import {Currency} from "../../entity/Currency";
import {RestException} from "../../middlewares/RestException";

const userRepository = AppDataSource.getRepository(User);
const countryRepository = AppDataSource.getRepository(Country);
const currencyRepository = AppDataSource.getRepository(Currency);


export const registerOneClick = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {country_id, currency_id} = req.body;

        if (country_id == null || currency_id == null) {
            throw RestException.badRequest("country_id and currency_id are required");
        }

        const country = await countryRepository.findOne({where: {id: country_id}});
        if (!country) {
            throw RestException.notFound("Country");
        }

        const currency = await currencyRepository.findOne({where: {id: currency_id}});
        if (!currency) {
            throw RestException.notFound("Currency");
        }

        const randomPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newUser = userRepository.create({
            password: hashedPassword,
            last_login_time: new Date(),
            country_id: country_id,
            currency_id: currency_id
        });
        // Fetch the user again to include related entities
        const savedUser = await userRepository.findOne({
            where: { id: newUser.id },
            relations: ['country', 'currency']
        });

        await userRepository.save(newUser);

        res.json({
            user_id: newUser.id,
            password: randomPassword,
            country: savedUser?.country,
            currency: savedUser?.currency
        });
    } catch (error) {
        next(error);
    }
};