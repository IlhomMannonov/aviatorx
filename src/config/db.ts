import {DataSource} from 'typeorm';
import config from './config';
import {User} from '../entity/User';
import {Wallet} from "../entity/Wallet";
import {Lang} from "../entity/Lang";
import {LangValue} from "../entity/LangValue";
import {Currency} from "../entity/Currency";
import {UserRole} from "../entity/UserRole";
import {Role} from "../entity/Role";
import {Department} from "../entity/Department";
import {Module} from "../entity/Module";
import {Attachment} from "../entity/Attachment";
import {PaymentMethod} from "../entity/PaymentMethod";
import {Permission} from "../entity/Permission";
import {StaticOption} from "../entity/StaticOption";
import {VerificationCode} from "../entity/VerificationCode";
import {Country} from "../entity/Country";
import {Payme} from "../entity/paymentBot/Payme";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    entities: [
        Attachment,
        User,
        Wallet,
        Lang,
        LangValue,
        Currency,
        UserRole,
        Role,
        Department,
        Module,
        Currency,
        PaymentMethod,
        Permission,
        StaticOption,
        VerificationCode,
        Country,
        Payme
    ],
    synchronize: true,
});

export const connectDB = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('PostgreSQL database connected');
    } catch (error) {
        console.error('Database connection error', error);
        process.exit(1);
    }
};
