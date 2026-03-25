import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async ensureUser(id: string, email: string): Promise<User> {
    const existingUser = await this.findOne(id);
    if (existingUser) {
      return existingUser;
    }
    
    return await this.create({
      id,
      email,
      isActive: true,
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      imageCreditBalance: 1,
      songCreditBalance: 1,
      mailedCardBalance: 0,
    });
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
}

