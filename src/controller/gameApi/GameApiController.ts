import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {NextFunction, Request, Response} from "express";
import axios from 'axios';
import {RestException} from "../../middlewares/RestException";
import {Wallet} from "../../entity/Wallet";
import {PaymentMethod} from "../../entity/PaymentMethod";
import {PaymentType} from "../../entity/enums/PaymentType";
import {Transaction} from "../../entity/Transaction";
import {pay} from "telegraf/typings/button";
import {Currency} from "../../entity/Currency";
import {Game} from "../../entity/Game";

const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
const transactionRepository = AppDataSource.getRepository(Transaction);
const currencyRepository = AppDataSource.getRepository(Currency);
const gameRepository = AppDataSource.getRepository(Game);


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

        const paymentMethod = await paymentMethodRepository.findOne({
            where: {
                type: PaymentType.OUT,
                deleted: false,
                status: 'active'
            }, order: {created_at: "DESC"}
        })
        const currency = await currencyRepository.findOne({where: {id: wallet.currency_id}})

        res.json({
            success: true,
            data: {
                withdrawMethod: paymentMethod,
                wallet_id: wallet.id,
                currency: currency?.name,
                amount: wallet.amount,
                user: {id: user.id, name: user.first_name + " " + user.last_name}
            }
        });

    } catch (error) {
        next(error);
    }
}

export const withdraw_request = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {user_id, card_number, amount} = req.body;
        if (!user_id || !card_number || !amount) {
            throw RestException.badRequest("user_id, card_number, amount is required");
        }
        const existsUser = userRepository.exists({where: {id: user_id}})

        if (!existsUser) {
            throw RestException.notFound("USER")
        }
        const wallet = await AppDataSource.getRepository(Wallet)
            .createQueryBuilder("wallet")
            .innerJoinAndSelect("wallet.user", "user") // 'user' bilan qo'shib olish
            .where("wallet.user_id = :user_id", {user_id})
            .andWhere("wallet.is_current = :isCurrent", {isCurrent: true})
            .andWhere("wallet.status = :status", {status: 'active'})
            .andWhere("wallet.deleted = :deleted", {deleted: false})
            .andWhere("user.status = :userStatus", {userStatus: 'active'})
            .andWhere("user.deleted = :userDeleted", {userDeleted: false})
            .getOne();
        if (!wallet) {
            throw RestException.notFound("WALLET")
        }

        if (wallet.amount < parseFloat(amount) || isNaN(parseFloat(amount))) {
            throw RestException.restThrow("Hisobingizda mablag' yetarli emas", 400);
        }
        const paymentMethod = await paymentMethodRepository.findOne({
            where: {
                type: PaymentType.OUT,
                deleted: false,
                status: 'active'
            }, order: {created_at: "DESC"}
        })
        if (!paymentMethod) {
            throw RestException.notFound("PAYMENT METHOD")
        }


        if (parseFloat(amount) < paymentMethod.min || parseFloat(amount) > paymentMethod.max) {
            throw RestException.restThrow("Mablag' chegarasida emas", 400);
        }

        wallet.amount -= amount;
        await walletRepository.save(wallet)
        await transactionRepository.save(transactionRepository.create({
            user_id: user_id,
            wallet_id: wallet.id,
            amount: amount,
            category: "Withdraw",
            platform: "Uzcard/Humo " + card_number,
            card_number: card_number,
            status: 'pending',
            desc: '',
        }));
        res.json({
            success: true,
            data: {
                amount: amount
            }
        });
    } catch (error) {
        next(error);
    }
}

export const games = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    gameRepository
        .createQueryBuilder("game")
        .leftJoinAndSelect("game.attachment_id", "attachment")
        .select([
            "game.id",
            "game.name",
            "game.status",
            "game.deleted",
            "attachment.file_name" // attachment dan faqat fileName ni tanlaymiz
        ])
        .where("game.deleted = :deleted", { deleted: false })
        .andWhere("game.status = :status", { status: "active" })
        .orderBy("game.id", "DESC")
        .getMany()
        .then(data => {
            res.json({ success: true, data: data });
        })
        .catch(error => {
            res.status(500).json({ success: false, message: 'Xato yuz berdi', error: error.message });
        });
}
