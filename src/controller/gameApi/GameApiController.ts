import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {NextFunction, Request, Response} from "express";
import axios from 'axios';
import {RestException} from "../../middlewares/RestException";
import {Wallet} from "../../entity/Wallet";

const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);


export const sports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const url = "https://api.sportmonks.com/v3/my/leagues?api_token=rp4padeOGfH6hwXeR5MWyEE5jq1hLVCaL68GZcyb3dzvxfZDEGrFUBliMvde&include=";

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch sports data'});
    }
};

export const user_amount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const accessToken = req.headers.authorization?.toString();
        if (!userId) {
            throw RestException.badRequest("id is required");
        }
        if (!accessToken) {
            throw RestException.badRequest("accessToken is required");
        }


        // Find the user by ID
        const wallet = await AppDataSource.getRepository(Wallet)
            .createQueryBuilder("wallet")
            .innerJoinAndSelect("wallet.user", "user") // 'user' bilan qo'shib olish
            .where("wallet.user_id = :userId", {userId})
            .andWhere("wallet.is_current = :isCurrent", {isCurrent: true})
            .andWhere("wallet.status = :status", {status: 'active'})
            .andWhere("wallet.deleted = :deleted", {deleted: false})
            .andWhere("user.status = :userStatus", {userStatus: 'active'})
            .andWhere("user.deleted = :userDeleted", {userDeleted: false})
            .getOne();


        if (!wallet) {
            throw RestException.notFound("wallet not found");
        }

        // Return user information (customize as needed)
        res.json({success: true, data: {amount: wallet.amount, wallet_id: wallet.id}});
    } catch (error) {
        next(error);
    }
};

export const update_wallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {user_id, is_add, amount, wallet_id} = req.body;

        if (!user_id) {
            throw RestException.badRequest("user_id is required");
        }

        if (!wallet_id) {
            throw RestException.badRequest("wallet_id is required");
        }

        const wallet = await walletRepository.findOne({where: {id: wallet_id}})
        if (!wallet) {
            throw RestException.notFound("wallet not found");
        }
        wallet.amount = parseFloat(wallet.amount.toString());
        if (is_add === true) {
            wallet.amount += parseFloat(amount);
        } else {
            if (wallet.amount < parseFloat(amount)) {
                throw RestException.badRequest("Insufficient balance");
            }
            wallet.amount -= parseFloat(amount);
        }

        await walletRepository.save(wallet);
        res.json({success: true, data: {amount: wallet.amount}});

    } catch (error) {
        next(error);
    }
}

export const user_data = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        if (!userId) {
            throw RestException.badRequest("id is required");
        }

        const user = await userRepository.findOne({where: {id: userId}})

        if (!user) {
            throw RestException.notFound("User");
        }

        const wallet = await AppDataSource.getRepository(Wallet)
            .createQueryBuilder("wallet")
            .innerJoinAndSelect("wallet.user", "user") // 'user' bilan qo'shib olish
            .where("wallet.user_id = :userId", {userId})
            .andWhere("wallet.is_current = :isCurrent", {isCurrent: true})
            .andWhere("wallet.status = :status", {status: 'active'})
            .andWhere("wallet.deleted = :deleted", {deleted: false})
            .andWhere("user.status = :userStatus", {userStatus: 'active'})
            .andWhere("user.deleted = :userDeleted", {userDeleted: false})
            .getOne();

        if (!wallet) {
            throw RestException.notFound("Wallet");
        }
        res.json({
            success: true,
            data: {
                wallet_id: wallet.id,
                currency: wallet.name,
                user: {id: user.id, name: user.first_name + " " + user.last_name}
            }
        });

    } catch (error) {
        next(error);
    }
}