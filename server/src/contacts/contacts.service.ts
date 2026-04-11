import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContact } from '../entities/user-contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(UserContact)
    private readonly userContactRepository: Repository<UserContact>,
  ) {}

  async findAll(userId: string): Promise<UserContact[]> {
    return await this.userContactRepository.find({
      where: { ownerUserId: userId },
      order: { contactName: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateContactDto): Promise<UserContact> {
    const contact = this.userContactRepository.create({
      ownerUserId: userId,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail ?? null,
      contactBirthday: dto.contactBirthday ?? null,
      mailingAddress: dto.mailingAddress ?? null,
      notes: dto.notes ?? null,
    });
    return await this.userContactRepository.save(contact);
  }

  async update(userId: string, contactId: string, dto: UpdateContactDto): Promise<UserContact> {
    const contact = await this.userContactRepository.findOne({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.ownerUserId !== userId) throw new ForbiddenException('Not your contact');

    Object.assign(contact, dto);
    return await this.userContactRepository.save(contact);
  }

  async remove(userId: string, contactId: string): Promise<void> {
    const contact = await this.userContactRepository.findOne({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.ownerUserId !== userId) throw new ForbiddenException('Not your contact');
    await this.userContactRepository.remove(contact);
  }
}
