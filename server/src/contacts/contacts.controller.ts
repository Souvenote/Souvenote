import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { ContactsService, CreateContactDto, UpdateContactDto } from './contacts.service';

@Controller('contacts')
@UseGuards(CognitoAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  getContacts(@CurrentUser() user: { sub: string }) {
    return this.contactsService.getContacts(user.sub);
  }

  @Post()
  createContact(@CurrentUser() user: { sub: string }, @Body() dto: CreateContactDto) {
    return this.contactsService.createContact(user.sub, dto);
  }

  @Patch(':id')
  updateContact(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.updateContact(user.sub, id, dto);
  }

  @Delete(':id')
  deleteContact(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.contactsService.deleteContact(user.sub, id);
  }
}
