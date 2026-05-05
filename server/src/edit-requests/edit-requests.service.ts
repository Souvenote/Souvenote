import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditRequest, EditRequestStatus } from '../entities/edit-request.entity';

export interface CreateEditRequestPayload {
  userId: string;
  imageId: string;
  cardId?: string;
  description: string;
}

@Injectable()
export class EditRequestsService {
  private readonly logger = new Logger(EditRequestsService.name);

  constructor(
    @InjectRepository(EditRequest)
    private readonly editRequestRepository: Repository<EditRequest>,
  ) {}

  async create(data: CreateEditRequestPayload): Promise<EditRequest> {
    const editRequest = this.editRequestRepository.create({
      userId: data.userId,
      imageId: data.imageId,
      cardId: data.cardId || null,
      description: data.description,
      status: EditRequestStatus.NEW,
    } as Partial<EditRequest>);

    const saved = await this.editRequestRepository.save(editRequest as EditRequest);

    this.logger.log(
      `Edit request created: id=${saved.id}, userId=${data.userId}, imageId=${data.imageId}`,
    );

    return saved;
  }

  async findMine(userId: string): Promise<EditRequest[]> {
    return this.editRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<EditRequest> {
    const editRequest = await this.editRequestRepository.findOne({
      where: { id, userId },
    });

    if (!editRequest) {
      throw new NotFoundException('Edit request not found');
    }

    return editRequest;
  }

  async updateStatus(
    id: string,
    status: EditRequestStatus,
    assignedTo?: string,
  ): Promise<EditRequest> {
    const editRequest = await this.editRequestRepository.findOne({
      where: { id },
    });

    if (!editRequest) {
      throw new NotFoundException('Edit request not found');
    }

    editRequest.status = status;

    if (assignedTo) {
      editRequest.assignedTo = assignedTo;
    }

    if (status === EditRequestStatus.DONE || status === EditRequestStatus.REJECTED) {
      editRequest.resolvedAt = new Date();
    }

    const saved = await this.editRequestRepository.save(editRequest);

    this.logger.log(`Edit request ${id} status updated to ${status}`);

    return saved;
  }
}
