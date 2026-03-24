import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CardTemplate } from '../entities/card-template.entity';
import {
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
} from './dto/create-card-template.dto';
import { QueryCardTemplatesDto } from './dto/query-card-templates.dto';

@Injectable()
export class CardTemplatesService {
  constructor(
    @InjectRepository(CardTemplate)
    private readonly cardTemplateRepository: Repository<CardTemplate>,
  ) {}

  async create(dto: CreateCardTemplateDto): Promise<CardTemplate> {
    const template = this.cardTemplateRepository.create(dto);
    return await this.cardTemplateRepository.save(template);
  }

  async findAll(query: QueryCardTemplatesDto): Promise<CardTemplate[]> {
    const baseWhere = {
      isActive: true,
      ...(query.category ? { category: query.category } : {}),
      ...(query.occasion ? { occasion: query.occasion } : {}),
      ...(query.featured ? { isPopular: true } : {}),
      ...(query.ready ? { isPersonalizable: false } : {}),
      ...(query.isPersonalizable !== undefined
        ? { isPersonalizable: query.isPersonalizable }
        : {}),
    };

    if (!query.search?.trim()) {
      return await this.cardTemplateRepository.find({
        where: baseWhere,
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
    }

    const searchValue = ILike(`%${query.search.trim()}%`);

    return await this.cardTemplateRepository.find({
      where: [
        { ...baseWhere, title: searchValue },
        { ...baseWhere, description: searchValue },
      ],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CardTemplate> {
    const template = await this.cardTemplateRepository.findOne({
      where: { id, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Card template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateCardTemplateDto): Promise<CardTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return await this.cardTemplateRepository.save(template);
  }

  async remove(id: string): Promise<CardTemplate> {
    const template = await this.findOne(id);
    template.isActive = false;
    return await this.cardTemplateRepository.save(template);
  }
}
