import { Injectable } from '@nestjs/common';
import { CreateCardIntakeResponseDto } from './dto/create-card-intake-response.dto';
import { UpdateCardIntakeResponseDto } from './dto/update-card-intake-response.dto';

@Injectable()
export class CardIntakeResponsesService {
  create(createCardIntakeResponseDto: CreateCardIntakeResponseDto) {
    return 'This action adds a new cardIntakeResponse';
  }

  findAll() {
    return `This action returns all cardIntakeResponses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cardIntakeResponse`;
  }

  update(id: number, updateCardIntakeResponseDto: UpdateCardIntakeResponseDto) {
    return `This action updates a #${id} cardIntakeResponse`;
  }

  remove(id: number) {
    return `This action removes a #${id} cardIntakeResponse`;
  }
}
