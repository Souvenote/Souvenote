import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('contacts')
@UseGuards(CognitoAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.contactsService.findAll(userId);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') contactId: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(userId, contactId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') contactId: string,
  ) {
    return this.contactsService.remove(userId, contactId);
  }
}
