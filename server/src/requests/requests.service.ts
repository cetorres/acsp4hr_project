import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatasetsService } from 'src/datasets/datasets.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { ApproveRejectDto } from './dto/approve_reject.dto';
import { RequestDto } from './dto/request.dto';
import { Request } from './entities';
import { RequestStatus } from './entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request) private readonly requestRepository: Repository<Request>,
    private readonly userService: UsersService,
    private readonly datasetService: DatasetsService
  ) {}

  async create(createDto: RequestDto) {
    try {
      const requester = await this.userService.findOneBy({ id: createDto.requesterId });
      const owner = await this.userService.findOneBy({ id: createDto.ownerId });
      const dataset = await this.datasetService.findOneBy({ id: createDto.datasetId });
      const newRequest = this.requestRepository.create({ ...createDto, requester, owner, dataset });
      await this.requestRepository.save(newRequest);

      return newRequest;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async countAll() {
    const total = await this.requestRepository.count();
    return total;
  }

  async findAllByRequester(userId: number, status: RequestStatus | null) {
    const whereClause = {
      requester: { id: userId }
    };
    if (status != null) {
      whereClause['status'] = status;
    }

    const [records, total] = await this.requestRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'dataset.id',
        'dataset.name',
        'r.description',
        'r.status',
        'r.createdAt',
        'r.updatedAt',
        'requester.id',
        'requester.firstName',
        'requester.lastName',
        'requester.email',
        'requester.bio',
        'requester.createdAt',
        'requester.updatedAt',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
        'owner.email',
        'owner.bio',
        'owner.createdAt',
        'owner.updatedAt'
      ])
      .leftJoin('r.requester', 'requester')
      .leftJoin('r.owner', 'owner')
      .leftJoin('r.dataset', 'dataset')
      .where(whereClause)
      .orderBy('r.created_at', 'DESC')
      // .skip((page - 1) * pageSize)
      // .take(pageSize)
      .getManyAndCount();

    return { data: records, total };
  }

  async findAllByOwner(userId: number, status: RequestStatus | null) {
    const whereClause = {
      owner: { id: userId }
    };
    if (status != null) {
      whereClause['status'] = status;
    }

    const [records, total] = await this.requestRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'dataset.id',
        'dataset.name',
        'r.description',
        'r.status',
        'r.createdAt',
        'r.updatedAt',
        'requester.id',
        'requester.firstName',
        'requester.lastName',
        'requester.email',
        'requester.bio',
        'requester.createdAt',
        'requester.updatedAt',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
        'owner.email',
        'owner.bio',
        'owner.createdAt',
        'owner.updatedAt'
      ])
      .leftJoin('r.requester', 'requester')
      .leftJoin('r.owner', 'owner')
      .leftJoin('r.dataset', 'dataset')
      .where(whereClause)
      .orderBy('r.created_at', 'DESC')
      // .skip((page - 1) * pageSize)
      // .take(pageSize)
      .getManyAndCount();

    return { data: records, total };
  }

  async findOneBy(condition: any) {
    try {
      //return await this.requestRepository.findOneByOrFail(condition);
      return await this.requestRepository
        .createQueryBuilder('r')
        .select([
          'r.id',
          'dataset.id',
          'dataset.name',
          'r.description',
          'r.status',
          'r.createdAt',
          'r.updatedAt',
          'requester.id',
          'requester.firstName',
          'requester.lastName',
          'requester.email',
          'requester.bio',
          'requester.createdAt',
          'requester.updatedAt',
          'owner.id',
          'owner.firstName',
          'owner.lastName',
          'owner.email',
          'owner.bio',
          'owner.createdAt',
          'owner.updatedAt'
        ])
        .leftJoin('r.requester', 'requester')
        .leftJoin('r.owner', 'owner')
        .leftJoin('r.dataset', 'dataset')
        .where(condition)
        .orderBy('r.created_at', 'DESC')
        .getOneOrFail();
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async approveReject(data: ApproveRejectDto) {
    try {
      await this.requestRepository.update({ id: data.requestId }, { status: data.status });

      return await this.requestRepository.findOneBy({ id: data.requestId });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async delete(id: number) {
    await this.requestRepository.delete(id);
  }
}
