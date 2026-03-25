import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardTemplate } from '../entities/card-template.entity';

const CARD_TEMPLATE_SEED_DATA: Array<Partial<CardTemplate>> = [
  {
    title: 'On This Day',
    description: 'A nostalgic birthday card styled like a keepsake timeline.',
    category: 'Birthday',
    occasion: 'Birthday',
    previewEmoji: '📅',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.49,
    config: { requiresBirthday: true },
    sortOrder: 1,
  },
  {
    title: 'Horoscope',
    description: 'A zodiac-inspired birthday card with an editorial cosmic vibe.',
    category: 'Birthday',
    occasion: 'Birthday',
    previewEmoji: '♈',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.49,
    config: { requiresBirthday: true },
    sortOrder: 2,
  },
  {
    title: 'Comic Card',
    description: 'A bold comic-book format for playful, larger-than-life messages.',
    category: 'General',
    occasion: 'General',
    previewEmoji: '🦸',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.99,
    sortOrder: 3,
  },
  {
    title: 'Book Cover',
    description: 'A literary cover-style card that turns your message into a story.',
    category: 'Anniversary',
    occasion: 'Anniversary',
    previewEmoji: '📖',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.99,
    sortOrder: 4,
  },
  {
    title: 'Mental Health',
    description: 'A gentle, supportive layout suited for encouragement and care.',
    category: 'Get Well',
    occasion: 'Get Well',
    previewEmoji: '🧠',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.49,
    sortOrder: 5,
  },
  {
    title: 'Courtroom Case',
    description: 'A witty verdict-themed card for congratulations and inside jokes.',
    category: 'Congratulations',
    occasion: 'Congratulations',
    previewEmoji: '⚖️',
    isPersonalizable: true,
    isPopular: true,
    basePrice: 8.99,
    sortOrder: 6,
  },
  {
    title: 'Balloon Bash',
    description: 'A bright celebration card built around cheerful party energy.',
    category: 'Birthday',
    occasion: 'Birthday',
    previewEmoji: '🎈',
    isPersonalizable: true,
    basePrice: 7.99,
    config: { requiresBirthday: true },
    sortOrder: 7,
  },
  {
    title: 'Forever Yours',
    description: 'A romantic design for anniversaries and heartfelt milestones.',
    category: 'Anniversary',
    occasion: 'Anniversary',
    previewEmoji: '💝',
    isPersonalizable: true,
    basePrice: 7.99,
    sortOrder: 8,
  },
  {
    title: 'Golden Balloons',
    description: 'A festive birthday design with polished gold balloons and celebratory sparkle.',
    category: 'Birthday',
    occasion: 'Birthday',
    previewEmoji: '🎈',
    isPersonalizable: false,
    isPopular: true,
    basePrice: 6.49,
    sortOrder: 9,
  },
  {
    title: 'Roses & Rings',
    description: 'An anniversary card with romantic florals and a classic keepsake feel.',
    category: 'Anniversary',
    occasion: 'Anniversary',
    previewEmoji: '🌹',
    isPersonalizable: false,
    basePrice: 6.79,
    sortOrder: 10,
  },
  {
    title: 'Sunflower Thanks',
    description: 'A warm thank-you card with bright sunflower energy and a soft handwritten tone.',
    category: 'Thank You',
    occasion: 'Thank You',
    previewEmoji: '🌻',
    isPersonalizable: false,
    basePrice: 6.69,
    sortOrder: 11,
  },
  {
    title: 'Confetti Burst',
    description: 'A bold congratulations card with colorful confetti and instant celebration.',
    category: 'Congratulations',
    occasion: 'Congratulations',
    previewEmoji: '🎉',
    isPersonalizable: false,
    isPopular: true,
    basePrice: 6.69,
    sortOrder: 12,
  },
  {
    title: 'Healing Vibes',
    description: 'A calm get-well card with soothing tones and a thoughtful bedside feel.',
    category: 'Get Well Soon',
    occasion: 'Get Well Soon',
    previewEmoji: '🌿',
    isPersonalizable: false,
    basePrice: 6.59,
    sortOrder: 13,
  },
  {
    title: 'Elegant Blush',
    description: 'A wedding card with soft blush florals and graceful ceremony styling.',
    category: 'Wedding',
    occasion: 'Wedding',
    previewEmoji: '💐',
    isPersonalizable: false,
    basePrice: 6.99,
    sortOrder: 14,
  },
  {
    title: 'Starry Night',
    description: 'A dreamy birthday card with celestial tones and a nighttime glow.',
    category: 'Birthday',
    occasion: 'Birthday',
    previewEmoji: '🌙',
    isPersonalizable: false,
    basePrice: 6.79,
    sortOrder: 15,
  },
  {
    title: 'Winter Wonderland',
    description: 'A snowy holiday card with a cozy seasonal mood and frosted detail.',
    category: 'Holiday',
    occasion: 'Holiday',
    previewEmoji: '❄️',
    isPersonalizable: false,
    basePrice: 6.89,
    config: { badge: 'New' },
    sortOrder: 16,
  },
  {
    title: 'Vintage Floral',
    description: 'A timeless thank-you card with delicate blooms and soft vintage charm.',
    category: 'Thank You',
    occasion: 'Thank You',
    previewEmoji: '🌸',
    isPersonalizable: false,
    basePrice: 6.69,
    sortOrder: 17,
  },
  {
    title: 'Little One',
    description: 'A sweet card for welcoming a new baby or new chapter.',
    category: 'New Baby',
    occasion: 'New Baby',
    previewEmoji: '🍼',
    isPersonalizable: true,
    basePrice: 7.99,
    sortOrder: 18,
  },
  {
    title: 'Just Because',
    description: 'A versatile, everyday card for thoughtful notes without an occasion.',
    category: 'Just Because',
    occasion: 'Just Because',
    previewEmoji: '✨',
    isPersonalizable: true,
    basePrice: 7.49,
    sortOrder: 19,
  },
];

@Injectable()
export class CardTemplatesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CardTemplatesSeedService.name);

  constructor(
    @InjectRepository(CardTemplate)
    private readonly cardTemplateRepository: Repository<CardTemplate>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    let createdCount = 0;
    let updatedCount = 0;

    for (const seedTemplate of CARD_TEMPLATE_SEED_DATA) {
      const existingTemplate = await this.cardTemplateRepository.findOne({
        where: { title: seedTemplate.title },
      });

      if (existingTemplate) {
        Object.assign(existingTemplate, seedTemplate, { isActive: true });
        await this.cardTemplateRepository.save(existingTemplate);
        updatedCount += 1;
        continue;
      }

      const template = this.cardTemplateRepository.create({
        ...seedTemplate,
        isActive: true,
      });
      await this.cardTemplateRepository.save(template);
      createdCount += 1;
    }

    const readyCardTitles = CARD_TEMPLATE_SEED_DATA.filter(
      (template) => template.isPersonalizable === false,
    ).map((template) => template.title);

    const existingReadyCards = await this.cardTemplateRepository.find({
      where: { isPersonalizable: false, isActive: true },
    });

    for (const readyCard of existingReadyCards) {
      if (!readyCardTitles.includes(readyCard.title)) {
        readyCard.isActive = false;
        await this.cardTemplateRepository.save(readyCard);
      }
    }

    this.logger.log(
      `Card template sync complete: created=${createdCount}, updated=${updatedCount}`,
    );
  }
}
