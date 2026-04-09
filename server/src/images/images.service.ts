import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GeneratedImage, ImageStatus } from '../entities/image.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import {
  CreditTransaction,
  TransactionType,
  CreditType,
} from '../entities/credit-transaction.entity';
import {
  RecraftService,
  type UploadedReferenceImage,
} from '../recraft/recraft.service';
import {
  CreateImageDto,
  AspectRatio,
  ReferenceBaseStyle,
  ResolutionTier,
} from './dto/create-image.dto';

interface UploadedReferenceFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectRepository(GeneratedImage)
    private readonly imageRepository: Repository<GeneratedImage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GreetingCard)
    private readonly cardRepository: Repository<GreetingCard>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
    private readonly recraftService: RecraftService,
  ) {}

  private toUploadedReferenceImages(
    files: UploadedReferenceFile[],
  ): UploadedReferenceImage[] {
    return files
      .filter((file) => file?.buffer?.length)
      .map((file) => ({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
      }));
  }

  private resolveReferenceBaseStyle(
    dto: CreateImageDto,
  ): 'any' | 'realistic_image' | 'digital_illustration' | 'vector_illustration' | 'icon' {
    return dto.referenceBaseStyle || ReferenceBaseStyle.DIGITAL_ILLUSTRATION;
  }

  private async submitGeneration(
    dto: CreateImageDto,
    referenceImages: UploadedReferenceFile[],
  ) {
    const aspectRatio = dto.aspectRatio || AspectRatio.PORTRAIT;
    const resolutionTier = dto.resolutionTier || ResolutionTier.ONE_K;
    const uploadedReferenceImages = this.toUploadedReferenceImages(referenceImages);

    if (!uploadedReferenceImages.length) {
      return this.recraftService.generateImage({
        prompt: dto.prompt,
        aspectRatio,
        resolutionTier,
        negativePrompt: dto.negativePrompt,
        model: dto.model,
        style: dto.style,
        styleId: dto.styleId,
      });
    }

    let derivedStyleId = dto.styleId;
    if (!derivedStyleId) {
      const createdStyle = await this.recraftService.createStyleReference({
        files: uploadedReferenceImages,
        baseStyle: this.resolveReferenceBaseStyle(dto),
      });
      derivedStyleId = createdStyle.styleId;
    }

    if (dto.identityPreservation) {
      return this.recraftService.generateFromReferenceImage({
        prompt: dto.prompt,
        aspectRatio,
        resolutionTier,
        negativePrompt: dto.negativePrompt,
        style: derivedStyleId ? undefined : dto.style,
        styleId: derivedStyleId,
        referenceImage: uploadedReferenceImages[0],
        strength: uploadedReferenceImages.length > 1 ? 0.18 : 0.22,
      });
    }

    return this.recraftService.generateImage({
      prompt: dto.prompt,
      aspectRatio,
      resolutionTier,
      negativePrompt: dto.negativePrompt,
      model: dto.model,
      style: derivedStyleId ? undefined : dto.style,
      styleId: derivedStyleId,
    });
  }

  async generateImage(
    userId: string,
    dto: CreateImageDto,
    referenceImages: UploadedReferenceFile[] = [],
  ): Promise<GeneratedImage> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.imageCreditBalance < 1) {
      throw new HttpException(
        {
          error: 'insufficient_credits',
          creditType: 'image',
          message: 'You need at least 1 image credit to generate an image',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Deduct credit before generation (mirrors music.service.ts:92-105)
    const balanceBefore = user.imageCreditBalance;
    user.imageCreditBalance -= 1;
    await this.userRepository.save(user);

    const creditTransaction = this.creditTransactionRepository.create({
      userId,
      type: TransactionType.USAGE,
      creditType: CreditType.IMAGE,
      amount: -1,
      balanceBefore,
      balanceAfter: user.imageCreditBalance,
      description: 'Image generation',
    });
    await this.creditTransactionRepository.save(creditTransaction);

    let recraftResponse;
    try {
      recraftResponse = await this.submitGeneration(dto, referenceImages);
    } catch (error) {
      this.logger.warn(
        `Recraft failed, refunding credit for user ${userId}`,
      );
      user.imageCreditBalance += 1;
      await this.userRepository.save(user);

      const refundTransaction = this.creditTransactionRepository.create({
        userId,
        type: TransactionType.REFUND,
        creditType: CreditType.IMAGE,
        amount: 1,
        balanceBefore: user.imageCreditBalance - 1,
        balanceAfter: user.imageCreditBalance,
        description: 'Image generation failed - credit refunded',
      });
      await this.creditTransactionRepository.save(refundTransaction);

      throw error;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const image = this.imageRepository.create({
      userId,
      cardId: dto.cardId,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      imageUrl: recraftResponse.imageUrl,
      provider: 'recraft',
      providerModel: recraftResponse.model,
      aspectRatio: dto.aspectRatio || AspectRatio.PORTRAIT,
      resolutionTier: recraftResponse.resolutionTier,
      width: recraftResponse.width,
      height: recraftResponse.height,
      status: ImageStatus.COMPLETED,
      expiresAt,
    });

    const savedImage = await this.imageRepository.save(image);

    creditTransaction.referenceId = savedImage.id;
    await this.creditTransactionRepository.save(creditTransaction);

    this.logger.log(`Image generated: imageId=${savedImage.id}`);

    return savedImage;
  }

  async getUserImages(userId: string): Promise<GeneratedImage[]> {
    return this.imageRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getImage(id: string, userId: string): Promise<GeneratedImage> {
    const image = await this.imageRepository.findOne({
      where: { id, userId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async linkImageToCard(
    imageId: string,
    cardId: string,
    userId: string,
  ): Promise<GeneratedImage> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.status !== ImageStatus.COMPLETED) {
      throw new ForbiddenException(
        'Image must be completed before linking to a card',
      );
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    image.cardId = cardId;
    card.imageId = imageId;

    await this.imageRepository.save(image);
    await this.cardRepository.save(card);

    this.logger.log(`Image ${imageId} linked to card ${cardId}`);

    return image;
  }

  async saveComposite(
    imageId: string,
    userId: string,
    compositeUrl: string,
    canvasJson?: Record<string, any>,
  ): Promise<GeneratedImage> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    image.compositeUrl = compositeUrl;
    if (canvasJson) {
      image.canvasJson = canvasJson;
    }

    await this.imageRepository.save(image);

    this.logger.log(`Composite saved for image ${imageId}`);

    return image;
  }

  async upscaleImage(
    imageId: string,
    userId: string,
    mode: 'crisp' | 'creative' = 'crisp',
  ): Promise<GeneratedImage> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (!image.imageUrl) {
      throw new NotFoundException('Image URL not found');
    }

    if (
      image.status === ImageStatus.COMPLETED &&
      ['2k', '4k'].includes(image.resolutionTier)
    ) {
      return image;
    }

    const upscaled = await this.recraftService.upscaleImage({
      imageUrl: image.imageUrl,
      mode,
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    image.imageUrl = upscaled.imageUrl;
    image.resolutionTier = '2k';

    await this.imageRepository.save(image);

    if (user) {
      const upscaleTransaction = this.creditTransactionRepository.create({
        userId,
        type: TransactionType.USAGE,
        creditType: CreditType.IMAGE,
        amount: 0,
        balanceBefore: user.imageCreditBalance,
        balanceAfter: user.imageCreditBalance,
        description: `Image upscale (${mode})`,
        referenceId: image.id,
      });
      await this.creditTransactionRepository.save(upscaleTransaction);
    }

    this.logger.log(`Image ${imageId} upscaled with Recraft (${mode})`);

    return image;
  }
}
