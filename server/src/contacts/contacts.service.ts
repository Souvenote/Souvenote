import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContact } from '../entities/user-contact.entity';

class CreateContactDto {
  contactName!: string;
  contactEmail?: string;
  contactBirthday?: string;
  mailingAddress?: string;
  notes?: string;
}

class UpdateContactDto {
  contactName?: string;
  contactEmail?: string;
  contactBirthday?: string;
  mailingAddress?: string;
  notes?: string;
}

export { CreateContactDto, UpdateContactDto };

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(UserContact)
    private readonly contactRepo: Repository<UserContact>,
  ) {}

  async getContacts(userId: string): Promise<UserContact[]> {
    return this.contactRepo.find({
      where: { ownerUserId: userId },
      order: { contactName: 'ASC' },
    });
  }

  async createContact(userId: string, dto: CreateContactDto): Promise<UserContact> {
    const contact = this.contactRepo.create({ ownerUserId: userId, ...dto });
    return this.contactRepo.save(contact);
  }

  async updateContact(userId: string, id: string, dto: UpdateContactDto): Promise<UserContact> {
    const contact = await this.contactRepo.findOne({ where: { id, ownerUserId: userId } });
    if (!contact) throw new NotFoundException('Contact not found');
    Object.assign(contact, dto);
    return this.contactRepo.save(contact);
  }

  async deleteContact(userId: string, id: string): Promise<void> {
    const contact = await this.contactRepo.findOne({ where: { id, ownerUserId: userId } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.contactRepo.remove(contact);
  }
}
