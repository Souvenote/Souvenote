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
import { CreateImageDto, type ImageModel } from './dto/create-image.dto';
import { ImageProviderFactory } from './providers/image-provider.factory';
import { CardPromptService } from '../card-prompts/card-prompt.service';
import { CardIntakeResponsesService } from '../card-intake-responses/card-intake-responses.service';
import { FlowType } from '../entities/card-intake-response.entity';

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
    private readonly providerFactory: ImageProviderFactory,
    private readonly cardPromptService: CardPromptService,
    private readonly cardIntakeResponsesService: CardIntakeResponsesService,
  ) {}

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

    const model: ImageModel = dto.imageModel || 'gpt_image_2';
    const provider = this.providerFactory.getProvider(model);
    const aspectRatio =
      (dto.aspectRatio as '3:4' | '4:3' | '1:1') || '3:4';

    let effectivePrompt = dto.prompt;
    let intakeResponseId: string | undefined;

    if (dto.cardType === 'build_my_card' && dto.intake) {
      const intake = dto.intake as any;
      const promptResult =
        this.cardPromptService.assembleBuildMyCardPrompt(intake);
      effectivePrompt = promptResult.assembledPrompt;

      const intakeRecord = await this.cardIntakeResponsesService.create({
        userId,
        flowType: FlowType.BUILD_MY_CARD,
        path: intake.image_usage_mode || undefined,
        payload: {
          rawIntake: intake,
          jsonTemplate: promptResult.jsonTemplate,
        },
        assembledPrompt: promptResult.assembledPrompt,
      });
      intakeResponseId = intakeRecord.id;
    }

    const deductionUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!deductionUser) {
      throw new NotFoundException('User not found');
    }

    const balanceBefore = deductionUser.imageCreditBalance;
    deductionUser.imageCreditBalance -= 1;
    await this.userRepository.save(deductionUser);

    const creditTransaction = this.creditTransactionRepository.create({
      userId,
      type: TransactionType.USAGE,
      creditType: CreditType.IMAGE,
      amount: -1,
      balanceBefore,
      balanceAfter: deductionUser.imageCreditBalance,
      description: `Image generation — ${((dto.intake as any)?.image_usage_mode || 'default')} mode`,
    });
    await this.creditTransactionRepository.save(creditTransaction);

    const referenceImageUrls = referenceImages.length > 0
      ? referenceImages.map((file) =>
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        )
      : undefined;

    let providerResponse;
    try {
      providerResponse = await provider.generate({
        prompt: effectivePrompt,
        aspectRatio,
        negativePrompt: dto.negativePrompt,
        referenceImageUrls,
        identityPreservation: dto.identityPreservation,
      });
    } catch (error) {
      this.logger.warn(
        `Image generation failed, refunding credit for user ${userId}`,
      );

      const refundUser = await this.userRepository.findOne({ where: { id: userId } });
      if (refundUser) {
        refundUser.imageCreditBalance += 1;
        await this.userRepository.save(refundUser);

        const refundTransaction = this.creditTransactionRepository.create({
          userId,
          type: TransactionType.REFUND,
          creditType: CreditType.IMAGE,
          amount: 1,
          balanceBefore: refundUser.imageCreditBalance - 1,
          balanceAfter: refundUser.imageCreditBalance,
          description: 'Image generation failed - credit refunded',
        });
        await this.creditTransactionRepository.save(refundTransaction);
      }

      throw error;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const image = this.imageRepository.create({
      userId,
      cardId: dto.cardId,
      prompt: effectivePrompt,
      negativePrompt: dto.negativePrompt,
      imageUrl: providerResponse.imageUrl,
      provider: `fal_${model}`,
      providerModel: providerResponse.model,
      providerTaskId: providerResponse.providerTaskId || undefined,
      aspectRatio,
      width: providerResponse.width,
      height: providerResponse.height,
      status: ImageStatus.COMPLETED,
      expiresAt,
    } as Partial<GeneratedImage>);

    const savedImage = await this.imageRepository.save(image as GeneratedImage);

    creditTransaction.referenceId = savedImage.id;
    await this.creditTransactionRepository.save(creditTransaction);

    if (intakeResponseId) {
      await this.cardIntakeResponsesService.linkToImage(
        intakeResponseId,
        savedImage.id,
        userId,
      );
    }

    this.logger.log(`Image generated: imageId=${savedImage.id} model=${model}`);

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

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      const upscaleTransaction = this.creditTransactionRepository.create({
        userId,
        type: TransactionType.USAGE,
        creditType: CreditType.IMAGE,
        amount: 0,
        balanceBefore: user.imageCreditBalance,
        balanceAfter: user.imageCreditBalance,
        description: `Image upscale (${mode}) - no-op for Fal.ai (GPT Image 2 generates at native res)`,
        referenceId: image.id,
      });
      await this.creditTransactionRepository.save(upscaleTransaction);
    }

    this.logger.log(`Image ${imageId} upscale requested (${mode}) - returning original`);

    return image;
  }
}
