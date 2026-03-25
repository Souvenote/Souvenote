import { IsEnum, IsString } from 'class-validator';

export enum PurchasePackTypeDto {
  CARD = 'card',
  CREDIT = 'credit',
}

export class CreatePurchaseSessionDto {
  @IsEnum(PurchasePackTypeDto)
  packType: PurchasePackTypeDto;

  @IsString()
  packId: string;
}
