import {NextFunction, Request, Response} from "express";
import {AppDataSource} from "../../config/db";
import {User} from "../../entity/User";
import {RestException} from "../../middlewares/RestException";
import {Wallet} from "../../entity/Wallet";
import {Transaction} from "../../entity/Transaction";
import {PaymentMethod} from "../../entity/PaymentMethod";

const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const transactionRepository = AppDataSource.getRepository(Transaction);
const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);

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
            wallet_id: wallet.id,
            status: 'success',
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

export const transactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = parseInt(req.params.id);

// Fetch transactions from the database
        const transactionData = await transactionRepository.find({
            where: {user_id: user_id, deleted: false},
            order: {id: 'DESC'}
        });

// Group transactions by date using a Map to maintain order
        const groupedTransactionsMap = new Map();

        transactionData.forEach(transaction => {
            const date = new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const transactionEntry = {
                method: transaction.platform,
                amount: transaction.amount.toLocaleString('ru-RU'),
                status: transaction.status,
                category: transaction.category,
                currency: "UZS",
            };

            // Group transactions by date
            if (!groupedTransactionsMap.has(date)) {
                groupedTransactionsMap.set(date, []);
            }
            groupedTransactionsMap.get(date).push(transactionEntry);
        });

// Convert Map to an array, preserving the date order
        const groupedTransactions = Array.from(groupedTransactionsMap, ([date, items]) => ({
            date,
            items
        }));

// Send the grouped data as JSON response
        res.json({transactions: groupedTransactions});

    } catch (err) {
        next(err);
    }
}


export const payment_methods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        paymentMethodRepository.find({where: {deleted: false, status: 'active'}, order: {id: 'DESC'}})
        .then((data) => res.json({success: true, data: data}))

    }catch (err)
    {
        next(err);
    }
}