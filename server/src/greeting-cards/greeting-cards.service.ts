import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreetingCard } from '../entities/greeting-card.entity';
import { GeneratedImage } from '../entities/image.entity';
import { CreateGreetingCardDto } from './dto/create-greeting-card.dto';
import { UpdateGreetingCardDto } from './dto/update-greeting-card.dto';

type GreetingCardWithPreview = GreetingCard & {
  previewImageUrl?: string | null;
  previewAspectRatio?: string | null;
};

@Injectable()
export class GreetingCardsService {
  constructor(
    @InjectRepository(GreetingCard)
    private readonly cardRepository: Repository<GreetingCard>,
    @InjectRepository(GeneratedImage)
    private readonly imageRepository: Repository<GeneratedImage>,
  ) {}

  private async attachPreview(
    card: GreetingCard,
  ): Promise<GreetingCardWithPreview> {
    if (!card.imageId) {
      return {
        ...card,
        previewImageUrl: null,
        previewAspectRatio: null,
      };
    }

    const image = await this.imageRepository.findOne({
      where: { id: card.imageId },
    });

    return {
      ...card,
      previewImageUrl: image?.compositeUrl || image?.imageUrl || null,
      previewAspectRatio: image?.aspectRatio || null,
    };
  }

  private async getOwnedCard(
    id: string,
    userId: string,
  ): Promise<GreetingCard> {
    const card = await this.cardRepository.findOne({
      where: { id, userId },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async create(userId: string, dto: CreateGreetingCardDto): Promise<GreetingCard> {
    const card = this.cardRepository.create({ ...dto, userId });
    return await this.cardRepository.save(card);
  }

  async findAll(userId: string): Promise<GreetingCardWithPreview[]> {
    const cards = await this.cardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return await Promise.all(cards.map((card) => this.attachPreview(card)));
  }

  async findOne(id: string, userId: string): Promise<GreetingCardWithPreview> {
    const card = await this.getOwnedCard(id, userId);
    return await this.attachPreview(card);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateGreetingCardDto,
  ): Promise<GreetingCard> {
    const card = await this.getOwnedCard(id, userId);
    Object.assign(card, dto);
    return await this.cardRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.getOwnedCard(id, userId);
    await this.cardRepository.remove(card);
  }
}
