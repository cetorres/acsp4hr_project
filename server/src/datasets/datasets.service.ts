import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetDto } from './dto';
import { Dataset } from './entities';
import { UsersService } from 'src/users/users.service';
import { Variable } from './entities/variable.entity';
import { DatasetUpdateDto } from './dto/dataset.update.dto';
import { Favorite } from './entities/favorite.entity';
import { encryptDecryptFile } from 'src/utils/file-crypto.utils';

@Injectable()
export class DatasetsService {
  security_algorithm: string;

  constructor(
    @InjectRepository(Dataset) private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(Variable) private readonly variableRepository: Repository<Variable>,
    @InjectRepository(Favorite) private readonly favoriteRepository: Repository<Favorite>,
    private readonly userService: UsersService
  ) {}

  async create(createDto: DatasetDto) {
    try {
      const user = await this.userService.findOneBy({ id: createDto.userId });
      const newDataset = this.datasetRepository.create({ ...createDto, user });
      await this.datasetRepository.save(newDataset);

      return newDataset;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async countAll() {
    const total = await this.datasetRepository.count({ where: { isActive: true } });
    return total;
  }

  async findAll() {
    const [records, total] = await this.datasetRepository.findAndCount({
      order: { name: 'ASC' }
    });

    // this.vaultService.getUser();

    return { data: records, total };
  }

  async browseAll(userId: number, searchText?: string | null) {
    const [records, total] = await this.datasetRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.description',
        'd.keywords',
        'd.requiresPermission',
        'd.rows',
        'd.createdAt',
        'd.updatedAt',
        'user.id',
        'user.firstName',
        'user.lastName'
      ])
      .leftJoin('d.user', 'user')
      .where({
        isActive: true
        // user: { id: Not(userId) }
      })
      .andWhere(`(d.name ILIKE :searchText OR d.description ILIKE :searchText OR d.keywords ILIKE :searchText)`, {
        searchText: `%${searchText ?? ''}%`
      })
      .orderBy('d.name', 'ASC')
      // .skip((page - 1) * pageSize)
      // .take(pageSize)
      .getManyAndCount();

    return { data: records, total };
  }

  async findAllByUser(userId: number) {
    const [records, total] = await this.datasetRepository.findAndCount({
      order: { name: 'ASC' },
      where: { user: { id: userId } }
    });

    // this.vaultService.getUser();

    return { data: records, total };
  }

  async browseOneBy(id: any, isMine?: boolean) {
    try {
      return await this.datasetRepository.findOneOrFail({
        relations: {
          user: true,
          variables: true
        },
        where: isMine ? { id: id } : { id: id, isActive: true },
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            createdAt: true,
            updatedAt: true
          }
        },
        order: {
          variables: {
            order: 'ASC'
          }
        }
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async getFavorites(userId: number) {
    const [records, total] = await this.favoriteRepository.findAndCount({
      relations: ['user', 'dataset.user'],
      where: {
        user: { id: userId },
        dataset: { isActive: true }
      },
      select: {
        user: {
          firstName: true,
          lastName: true
        },
        dataset: {
          id: true,
          name: true,
          description: true,
          rows: true,
          user: {
            firstName: true,
            lastName: true
          },
          createdAt: true,
          updatedAt: true
        }
      }
    });
    return { data: records, total };
  }

  async isFavorite(userId: number, datasetId: number) {
    const result = await this.favoriteRepository.findOneBy({
      user: { id: userId },
      dataset: { id: datasetId }
    });
    return result != null;
  }

  async addFavorite(userId: number, datasetId: number) {
    try {
      const user = await this.userService.findOneBy({ id: userId });
      const dataset = await this.datasetRepository.findOneBy({ id: datasetId });
      const newFavorite = this.favoriteRepository.create({ dataset, user });
      await this.favoriteRepository.save(newFavorite);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeFavorite(userId: number, datasetId: number) {
    try {
      return this.favoriteRepository.delete({ user: { id: userId }, dataset: { id: datasetId } });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOneBy(condition: any) {
    try {
      return await this.datasetRepository.findOneByOrFail(condition);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async update(id: number, updateDto: DatasetUpdateDto) {
    try {
      const variables = [...updateDto.variables];
      delete updateDto.variables;
      delete updateDto.id;
      await this.datasetRepository.update(+id, updateDto);

      const dataset = await this.datasetRepository.findOneBy({ id });

      await this.variableRepository.delete({ dataset });

      variables.forEach((variable) => {
        const variableEntity = this.variableRepository.create(variable);
        variableEntity.dataset = dataset;
        this.variableRepository.save(variableEntity);
      });

      return await this.datasetRepository.findOneBy({ id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async delete(id: number) {
    return await this.datasetRepository.delete(id);
  }

  async encryptDatasets(destination: string) {
    const datasets = await this.datasetRepository.find();

    datasets.forEach(async (dataset) => {
      const user = await dataset.user;
      const filePath = destination + '/' + dataset.filename;
      encryptDecryptFile(false, filePath, filePath, user.salt, user.secureToken);
    });

    return true;
  }
}
