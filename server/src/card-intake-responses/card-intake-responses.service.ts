import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CardIntakeResponse,
  FlowType,
} from '../entities/card-intake-response.entity';

export interface CreateIntakePayload {
  userId: string;
  flowType: FlowType;
  path?: string;
  payload: Record<string, any>;
  assembledPrompt?: string;
  imageId?: string;
  cardId?: string;
}

@Injectable()
export class CardIntakeResponsesService {
  constructor(
    @InjectRepository(CardIntakeResponse)
    private readonly intakeRepository: Repository<CardIntakeResponse>,
  ) {}

  async create(data: CreateIntakePayload): Promise<CardIntakeResponse> {
    const intake = this.intakeRepository.create({
      userId: data.userId,
      flowType: data.flowType,
      path: data.path || null,
      payload: data.payload,
      assembledPrompt: data.assembledPrompt || null,
      imageId: data.imageId || null,
      cardId: data.cardId || null,
    } as Partial<CardIntakeResponse>);

    return this.intakeRepository.save(intake as CardIntakeResponse);
  }

  async findByUser(userId: string): Promise<CardIntakeResponse[]> {
    return this.intakeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<CardIntakeResponse> {
    const intake = await this.intakeRepository.findOne({
      where: { id, userId },
    });

    if (!intake) {
      throw new NotFoundException('Intake response not found');
    }

    return intake;
  }

  async linkToImage(id: string, imageId: string, userId: string): Promise<CardIntakeResponse> {
    const intake = await this.findOne(id, userId);
    intake.imageId = imageId;
    return this.intakeRepository.save(intake);
  }

  async linkToCard(id: string, cardId: string, userId: string): Promise<CardIntakeResponse> {
    const intake = await this.findOne(id, userId);
    intake.cardId = cardId;
    return this.intakeRepository.save(intake);
  }
}
