import {NextFunction, Request, Response} from "express";
import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {RestException} from "../../middlewares/RestException";
import {Wallet} from "../../entity/Wallet";
import {Transaction} from "../../entity/Transaction";

const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const transactionRepository = AppDataSource.getRepository(Transaction);

export const uzPayBot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {user_id, card_number, amount} = req.body;

        // Parametrlarning mavjudligini tekshirish
        if (!user_id || !card_number || !amount) {
            throw RestException.badRequest("user_id, card_number, and amount are required");
        }

        // Foydalanuvchi hamyonini topish
        const wallet = await AppDataSource.getRepository(Wallet)
            .createQueryBuilder("wallet")
            .innerJoinAndSelect("wallet.user", "user")
            .where("wallet.user_id = :user_id", {user_id})
            .andWhere("wallet.is_current = :isCurrent", {isCurrent: true})
            .andWhere("wallet.status = :status", {status: 'active'})
            .andWhere("wallet.deleted = :deleted", {deleted: false})
            .andWhere("user.status = :userStatus", {userStatus: 'active'})
            .andWhere("user.deleted = :userDeleted", {userDeleted: false})
            .getOne();

        if (!wallet) {
            throw RestException.notFound("WALLET");
        }

        // Tranzaktsiyani saqlash
        const newTransaction = transactionRepository.create({
            amount: amount,
            desc: "Uz Pay Bot",
            category: "Deposit",
            card_number: card_number,
            platform: "Humo/Uzcard",
            user_id: user_id,
            wallet_id: wallet.id
        });
        await transactionRepository.save(newTransaction);

        // Hamyon miqdorini yangilash
        await walletRepository
            .createQueryBuilder()
            .update(Wallet)
            .set({amount: () => `amount + ${parseFloat(amount)}`})
            .where("id = :id", {id: wallet.id})
            .execute();

        res.status(200).json({message: "Transaction completed successfully"});
    } catch (err) {
        next(err);
    }
};
