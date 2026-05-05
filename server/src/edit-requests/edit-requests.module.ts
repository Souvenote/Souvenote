import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditRequest } from '../entities/edit-request.entity';
import { AuthModule } from '../auth/auth.module';
import { EditRequestsService } from './edit-requests.service';
import { EditRequestsController } from './edit-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EditRequest]), AuthModule],
  controllers: [EditRequestsController],
  providers: [EditRequestsService],
  exports: [EditRequestsService],
})
export class EditRequestsModule {}
