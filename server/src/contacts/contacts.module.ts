import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContact } from '../entities/user-contact.entity';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserContact])],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
