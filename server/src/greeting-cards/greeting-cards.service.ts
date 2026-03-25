import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreetingCard } from '../entities/greeting-card.entity';
import { CreateGreetingCardDto } from './dto/create-greeting-card.dto';
import { UpdateGreetingCardDto } from './dto/update-greeting-card.dto';

@Injectable()
export class GreetingCardsService {
  constructor(
    @InjectRepository(GreetingCard)
    private readonly cardRepository: Repository<GreetingCard>,
  ) {}

  async create(userId: string, dto: CreateGreetingCardDto): Promise<GreetingCard> {
    const card = this.cardRepository.create({ ...dto, userId });
    return await this.cardRepository.save(card);
  }

  async findAll(userId: string): Promise<GreetingCard[]> {
    return await this.cardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<GreetingCard> {
    const card = await this.cardRepository.findOne({
      where: { id, userId },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateGreetingCardDto,
  ): Promise<GreetingCard> {
    const card = await this.findOne(id, userId);
    Object.assign(card, dto);
    return await this.cardRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id, userId);
    await this.cardRepository.remove(card);
  }
}
