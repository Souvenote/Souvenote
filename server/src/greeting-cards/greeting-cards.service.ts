import { Injectable } from '@nestjs/common';
import { CreateGreetingCardDto } from './dto/create-greeting-card.dto';
import { UpdateGreetingCardDto } from './dto/update-greeting-card.dto';

@Injectable()
export class GreetingCardsService {
  create(createGreetingCardDto: CreateGreetingCardDto) {
    return 'This action adds a new greetingCard';
  }

  findAll() {
    return `This action returns all greetingCards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} greetingCard`;
  }

  update(id: number, updateGreetingCardDto: UpdateGreetingCardDto) {
    return `This action updates a #${id} greetingCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} greetingCard`;
  }
}
