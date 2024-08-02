import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entity/User';

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await userRepository.find();
  res.json(users);
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const user = userRepository.create(req.body);
  const result = await userRepository.save(user);
  res.json(result);
};
