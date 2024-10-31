import {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';

import crypto from "crypto";
import {RestException} from "./RestException";

dotenv.config();

// Secret keyni saqlaydigan fayl (config fayl)
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({message: "Token taqdim etilmagan."});
    }

    try {
        if (!process.env.GAME_ACCESS_ID) {
            throw new Error("GAME_ACCESS_ID muhit o‘zgaruvchisi mavjud emas.");
        }

        const access = await verifyHash(process.env.GAME_ACCESS_ID, token)

        if (!access) {
            throw RestException.restThrow("Unauthorized", 401);
        }
        next(); // Keyingi middleware yoki controllerga o'tkazish
    } catch (error) {
        return res.status(401).json({message: "Noto‘g‘ri yoki amal qilish muddati tugagan token."});
    }
}


async function hashWithSHA256(message: string) {
    const msgBuffer = new TextEncoder().encode(message); // Message ni UTF-8 ga o'giradi
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // SHA-256 orqali hash qiladi
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Hash ni baytlarga o'giradi
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Hash ni 16-lik satrga o'giradi
}

async function verifyHash(message: string, hash: string) {
    const messageHash = await hashWithSHA256(message);
    return messageHash === hash; // True agar mos bo'lsa
}