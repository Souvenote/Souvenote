import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateImageDto } from './dto/create-image.dto';
import { LinkImageDto } from './dto/link-image.dto';
import { UpscaleImageDto } from './dto/upscale-image.dto';

interface UploadedReferenceFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('images')
@UseGuards(CognitoAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('generate')
  @UseInterceptors(FilesInterceptor('referenceImages', 5))
  async generateImage(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateImageDto,
    @UploadedFiles() referenceImages?: UploadedReferenceFile[],
  ) {
    return this.imagesService.generateImage(userId, dto, referenceImages || []);
  }

  @Get('my-images')
  async getMyImages(@CurrentUser('sub') userId: string) {
    return this.imagesService.getUserImages(userId);
  }

  @Get(':id')
  async getImage(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.getImage(id, userId);
  }

  @Post('link/:imageId')
  async linkImageToCard(
    @Param('imageId') imageId: string,
    @Body() dto: LinkImageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.linkImageToCard(imageId, dto.cardId, userId);
  }

  @Post(':imageId/composite')
  async saveComposite(
    @Param('imageId') imageId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { compositeUrl: string; canvasJson?: Record<string, any> },
  ) {
    return this.imagesService.saveComposite(
      imageId,
      userId,
      body.compositeUrl,
      body.canvasJson,
    );
  }

  @Post(':imageId/upscale')
  async upscaleImage(
    @Param('imageId') imageId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpscaleImageDto,
  ) {
    return this.imagesService.upscaleImage(imageId, userId, dto.mode);
  }
}
