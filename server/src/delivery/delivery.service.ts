import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  CardFormat,
  DeliveryStatus,
  GreetingCard,
} from '../entities/greeting-card.entity';
import { CardTemplate } from '../entities/card-template.entity';
import { Song } from '../entities/song.entity';
import { MusicService } from '../music/music.service';
import { CreateDigitalDeliveryDto } from './dto/create-digital-delivery.dto';
import { CreatePhysicalDeliveryDto } from './dto/create-physical-delivery.dto';

export interface DeliveryTemplateSummary {
  title?: string;
  occasion?: string;
  previewEmoji?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface DeliveryResponse {
  cardId: string;
  format: CardFormat;
  deliveryStatus: DeliveryStatus;
  recipientName?: string;
  recipientEmail?: string;
  deliveryMessage?: string;
  shareToken?: string;
  shareUrl: string | null;
  shippingAddress: Record<string, any> | null;
  template: DeliveryTemplateSummary | null;
  songId: string | null;
  personalizationData: Record<string, any> | null;
}

export interface SharedCardResponse {
  card: {
    id: string;
    format: CardFormat;
    title: string;
    occasion?: string;
    recipientName?: string;
    personalMessage?: string;
    caption?: string;
    deliveryMessage?: string;
    previewEmoji?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
  };
  song: {
    id: string;
    title?: string;
    duration?: number;
    style?: string;
    generationMethod: string;
  } | null;
}

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(GreetingCard)
    private readonly cardRepository: Repository<GreetingCard>,
    @InjectRepository(CardTemplate)
    private readonly cardTemplateRepository: Repository<CardTemplate>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    private readonly configService: ConfigService,
    private readonly musicService: MusicService,
  ) {}

  async getDelivery(cardId: string, userId: string): Promise<DeliveryResponse> {
    const card = await this.getOwnedCard(cardId, userId);
    return this.buildDeliveryResponse(card);
  }

  async saveDigitalDelivery(
    cardId: string,
    userId: string,
    dto: CreateDigitalDeliveryDto,
  ): Promise<DeliveryResponse> {
    const card = await this.getOwnedCard(cardId, userId);

    if (card.format !== CardFormat.DIGITAL) {
      throw new BadRequestException('This card was created as a physical card');
    }

    if (!card.shareToken) {
      card.shareToken = this.generateShareToken();
    }

    card.recipientName = dto.recipientName?.trim() || card.recipientName;
    card.recipientEmail = dto.recipientEmail?.trim() || undefined;
    card.deliveryMessage = dto.deliveryMessage?.trim() || undefined;
    card.deliveryStatus = DeliveryStatus.SHARED;
    card.deliveredAt = new Date();

    await this.cardRepository.save(card);
    return this.buildDeliveryResponse(card);
  }

  async savePhysicalDelivery(
    cardId: string,
    userId: string,
    dto: CreatePhysicalDeliveryDto,
  ): Promise<DeliveryResponse> {
    const card = await this.getOwnedCard(cardId, userId);

    if (card.format !== CardFormat.PHYSICAL) {
      throw new BadRequestException('This card was created as a digital card');
    }

    card.recipientName = dto.recipientName?.trim() || dto.shippingAddress.fullName.trim();
    card.deliveryMessage = dto.deliveryMessage?.trim() || undefined;
    card.shippingAddress = {
      ...dto.shippingAddress,
      fullName: dto.shippingAddress.fullName.trim(),
      line1: dto.shippingAddress.line1.trim(),
      line2: dto.shippingAddress.line2?.trim() || undefined,
      city: dto.shippingAddress.city.trim(),
      province: dto.shippingAddress.province.trim(),
      postalCode: dto.shippingAddress.postalCode.trim(),
      country: dto.shippingAddress.country?.trim() || 'Canada',
    };
    card.deliveryStatus = DeliveryStatus.ADDRESS_RECEIVED;

    await this.cardRepository.save(card);
    return this.buildDeliveryResponse(card);
  }

  async getSharedCard(token: string): Promise<SharedCardResponse> {
    const card = await this.cardRepository.findOne({
      where: { shareToken: token },
    });

    if (!card) {
      throw new NotFoundException('Shared card not found');
    }

    const template = await this.resolveTemplateSummary(card);
    const song = card.songId
      ? await this.songRepository.findOne({
          where: { id: card.songId },
        })
      : null;

    return {
      card: {
        id: card.id,
        format: card.format,
        title:
          card.personalizationData?.templateTitle ||
          template?.title ||
          card.personalizationData?.occasion ||
          'Souvenote Card',
        occasion: card.personalizationData?.occasion || template?.occasion,
        recipientName: card.recipientName || card.personalizationData?.recipientName,
        personalMessage: card.personalizationData?.personalMessage,
        caption: card.personalizationData?.caption,
        deliveryMessage: card.deliveryMessage,
        previewEmoji: template?.previewEmoji,
        imageUrl: template?.imageUrl,
        thumbnailUrl: template?.thumbnailUrl,
      },
      song: song
        ? {
            id: song.id,
            title: song.title,
            duration: song.duration,
            style: song.style,
            generationMethod: song.generationMethod,
          }
        : null,
    };
  }

  async getSharedCardAudio(token: string) {
    const card = await this.cardRepository.findOne({
      where: { shareToken: token },
    });

    if (!card) {
      throw new NotFoundException('Shared card not found');
    }

    if (!card.songId) {
      throw new NotFoundException('This shared card does not have a song attached');
    }

    return this.musicService.getSharedSongAudio(card.songId);
  }

  private async getOwnedCard(cardId: string, userId: string): Promise<GreetingCard> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  private async buildDeliveryResponse(card: GreetingCard): Promise<DeliveryResponse> {
    const template = await this.resolveTemplateSummary(card);

    return {
      cardId: card.id,
      format: card.format,
      deliveryStatus: card.deliveryStatus,
      recipientName: card.recipientName,
      recipientEmail: card.recipientEmail,
      deliveryMessage: card.deliveryMessage,
      shareToken: card.shareToken,
      shareUrl: card.shareToken ? this.buildShareUrl(card.shareToken) : null,
      shippingAddress: card.shippingAddress || null,
      template: template || null,
      songId: card.songId || null,
      personalizationData: card.personalizationData || null,
    };
  }

  private async resolveTemplateSummary(card: GreetingCard): Promise<DeliveryTemplateSummary | null> {
    if (card.cardTemplateId) {
      const templateById = await this.cardTemplateRepository.findOne({
        where: { id: card.cardTemplateId, isActive: true },
      });

      if (templateById) {
        return this.toTemplateSummary(templateById);
      }
    }

    const templateTitle = card.personalizationData?.templateTitle;

    if (!templateTitle) {
      return null;
    }

    const templateByTitle = await this.cardTemplateRepository.findOne({
      where: { title: templateTitle, isActive: true },
    });

    return templateByTitle ? this.toTemplateSummary(templateByTitle) : null;
  }

  private toTemplateSummary(template: CardTemplate): DeliveryTemplateSummary {
    return {
      title: template.title,
      occasion: template.occasion,
      previewEmoji: template.previewEmoji,
      imageUrl: template.imageUrl,
      thumbnailUrl: template.thumbnailUrl,
    };
  }

  private buildShareUrl(token: string): string {
    const clientUrl =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost:3000';

    return `${clientUrl.replace(/\/$/, '')}/share/${token}`;
  }

  private generateShareToken(): string {
    return randomBytes(18).toString('hex');
  }
}
