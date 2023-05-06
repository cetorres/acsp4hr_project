import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset } from 'src/datasets/entities';
import { Messages } from 'src/helpers';
import { Request } from 'src/requests/entities';
import { RequestStatus } from 'src/requests/entities/request.entity';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { encryptDecryptFile } from 'src/utils/file-crypto.utils';
import { getFileContent, removeFile } from 'src/utils/file.utils';
import { IsNull, Repository } from 'typeorm';
import { ComputationDto } from './dto/computation.dto';
import { ComputationRunDto } from './dto/computation_run.dto';
import { Computation, ComputationReturnType } from './entities/computation.entity';
import { ComputationRun, ComputationRunStatus } from './entities/computation_run.entity';
import { ComputationSuggestion } from './entities/computation_suggestion.entity';
import { ComputationSuggestionDto } from './dto/computation_suggestion.dto';

/* eslint-disable @typescript-eslint/no-var-requires */
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

@Injectable()
export class ComputationsService {
  constructor(
    @InjectRepository(Computation) private readonly computationRepository: Repository<Computation>,
    @InjectRepository(ComputationRun) private readonly computationRunRepository: Repository<ComputationRun>,
    @InjectRepository(ComputationSuggestion)
    private readonly computationSuggestionRepository: Repository<ComputationSuggestion>,
    @InjectRepository(Request) private readonly requestRepository: Repository<Request>,
    @InjectRepository(Dataset) private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService
  ) {}

  async create(createDto: ComputationDto) {
    try {
      const newComputation = this.computationRepository.create({ ...createDto });
      await this.computationRepository.save(newComputation);

      return newComputation;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createComputationRun(createDto: ComputationRunDto, runnerId: number) {
    try {
      const request = createDto.requestId ? await this.requestRepository.findOneBy({ id: createDto.requestId }) : null;
      if (request && request.status != RequestStatus.Granted) {
        throw new BadRequestException('Request is not approved.');
      }
      const dataset = createDto.datasetId ? await this.datasetRepository.findOneBy({ id: createDto.datasetId }) : null;
      const runner = runnerId ? await this.userRepository.findOneBy({ id: runnerId }) : null;
      if (!request && dataset && runner) {
        const datasetUser = await dataset?.user;
        if (!dataset?.requiresPermission || datasetUser?.id == runner?.id) {
        } else {
          throw new BadRequestException('You are not allowed to run computations on this dataset.');
        }
      }
      const computation = await this.computationRepository.findOneBy({ id: createDto.computationId });
      const newComputationRun = this.computationRunRepository.create(
        request ? { ...createDto, request, computation, runner } : { ...createDto, dataset, computation, runner }
      );
      await this.computationRunRepository.save(newComputationRun);

      return newComputationRun;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: number, updateDto: ComputationDto) {
    try {
      await this.computationRepository.update(+id, updateDto);
      return await this.computationRepository.findOneBy({ id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateComputationRun(id: number, updateDto: ComputationRunDto) {
    try {
      await this.computationRunRepository.update(+id, updateDto);
      return await this.computationRepository.findOneBy({ id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async countAll() {
    const total = await this.computationRepository.count({ where: { isActive: true } });
    return total;
  }

  async countAllComputationRuns() {
    const total = await this.computationRunRepository.count();
    return total;
  }

  async findAll(condition: any | null = { where: { isActive: true } }) {
    const conditionObj = condition == null ? { order: { name: 'ASC' } } : { ...condition, order: { name: 'ASC' } };
    const [records, total] = await this.computationRepository.findAndCount(conditionObj);

    return { data: records, total };
  }

  async getScriptById(id: number) {
    try {
      const computation = await this.findOneBy({ id: id });

      // Get script content
      const scriptCommand = computation.scriptCommand;
      const scriptPath = scriptCommand.split(' ')[1];
      let script = getFileContent(scriptPath);

      // Clean script removing sensitive information
      script = script.replace('dataset_plot_images/', '');

      return script;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async findAllComputationRuns(condition?: any | null) {
    const conditionObj =
      condition == null ? { order: { updateAt: 'DESC' } } : { ...condition, order: { updateAt: 'DESC' } };
    const [records, total] = await this.computationRunRepository.findAndCount(conditionObj);

    return { data: records, total };
  }

  async findAllComputationRunsBy(condition: any) {
    const [records, total] = await this.computationRunRepository
      .createQueryBuilder('cr')
      .select([
        'cr.id',
        'cr.resultText',
        'cr.resultImage',
        'cr.runStatus',
        'cr.variables',
        'cr.createdAt',
        'cr.updatedAt',
        'request.id',
        'request.description',
        'computation.id',
        'computation.name',
        'computation.description',
        'computation.isActive',
        'computation.returnType',
        'computation.numberOfVariables',
        'dataset.id',
        'dataset.name',
        'request_dataset.id',
        'request_dataset.name'
      ])
      .leftJoin('cr.request', 'request')
      .leftJoin('cr.computation', 'computation')
      .leftJoin('cr.runner', 'runner')
      .leftJoin('cr.dataset', 'dataset')
      .leftJoin('request.dataset', 'request_dataset')
      .where(condition)
      .orderBy('cr.updated_at', 'DESC')
      // .skip((page - 1) * pageSize)
      // .take(pageSize)
      .getManyAndCount();

    return { data: records, total };
  }

  async findOneBy(condition: any) {
    try {
      return await this.computationRepository.findOneByOrFail(condition);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async findOneComputationRunBy(condition: any) {
    try {
      const computationRun = await this.computationRunRepository
        .createQueryBuilder('cr')
        .select([
          'cr.id',
          'cr.resultText',
          'cr.resultImage',
          'cr.runStatus',
          'cr.variables',
          'cr.createdAt',
          'cr.updatedAt',
          'request.id',
          'request.description',
          'computation.id',
          'computation.name',
          'computation.description',
          'computation.isActive',
          'computation.returnType',
          'computation.numberOfVariables',
          'dataset.id',
          'dataset.name',
          'request_dataset.id',
          'request_dataset.name'
        ])
        .leftJoin('cr.request', 'request')
        .leftJoin('cr.computation', 'computation')
        .leftJoin('cr.runner', 'runner')
        .leftJoin('cr.dataset', 'dataset')
        .leftJoin('request.dataset', 'request_dataset')
        .where(condition)
        .getOneOrFail();
      return computationRun;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async fillUpRunners() {
    const compRuns = await this.computationRunRepository.find({
      where: { runner: IsNull() }
    });

    compRuns.forEach(async (compRun) => {
      const request = await compRun.request;
      const runner = await request.requester;
      await this.computationRunRepository.update(compRun.id, { runner: runner });
    });

    return true;
  }

  async checkPendindComputations() {
    const [_, total] = await this.computationRunRepository.findAndCount({
      where: { runStatus: ComputationRunStatus.Pending }
    });

    return total;
  }

  async runPendindComputations() {
    const compsToRun = await this.computationRunRepository.find({
      relations: ['dataset', 'request.dataset'],
      where: { runStatus: ComputationRunStatus.Pending }
    });

    const promises = [] as Promise<boolean>[];

    for (let i = 0; i < compsToRun?.length; i++) {
      const promise = new Promise<boolean>(async (resolve, reject) => {
        try {
          // Set computation run to status running
          await this.computationRunRepository.update(compsToRun[i].id, { runStatus: ComputationRunStatus.Running });

          const computation = await compsToRun[i].computation;
          let scriptCommand = computation.scriptCommand;
          let dataset = null;

          if (compsToRun[i]['__request__']?.id) {
            dataset = compsToRun[i]['__request__']['__dataset__'];
          } else {
            dataset = compsToRun[i]['__dataset__'];
          }

          const user = await dataset.user;
          const variables = compsToRun[i].variables;

          // Decrypt dataset file temporarily to run computation
          const datasetFile = './dataset_files/' + dataset.filename;
          const datasetFileDec = datasetFile + '.dec';
          const result = encryptDecryptFile(true, datasetFile, datasetFileDec, user.salt, user.secureToken);
          if (!result) {
            throw new Error('Could not decrypt dataset file.');
          }

          // Replace parameters on script command
          scriptCommand = scriptCommand.replace('{dataset_file}', datasetFileDec);
          scriptCommand = scriptCommand.replace('{variable}', `"${variables}"`);
          scriptCommand = scriptCommand.replace('{variables}', `"${variables}"`);
          scriptCommand = scriptCommand.replace('{user_id}', user.id);

          // Execute command and get output
          const rawOutput = await exec(scriptCommand);
          const output = rawOutput.stdout.trim();

          // Delete decrypted dataset file
          removeFile('./dataset_files/', dataset.filename + '.dec');

          // Process output
          if (!output || output == '') {
            // Save computation run error
            await this.computationRunRepository.update(compsToRun[i].id, {
              runStatus: ComputationRunStatus.Error,
              resultText: ''
            });
          } else {
            if (computation.returnType == ComputationReturnType.Text) {
              // Save computation run result (text)
              await this.computationRunRepository.update(compsToRun[i].id, {
                runStatus: ComputationRunStatus.Success,
                resultText: output
              });
            } else {
              // Save computation run result (graph or text and graph)
              if (output.includes('Saved plot')) {
                let imageOutput = output.split(':');
                imageOutput = imageOutput[imageOutput.length - 1].trim();
                await this.computationRunRepository.update(compsToRun[i].id, {
                  runStatus: ComputationRunStatus.Success,
                  resultText: output,
                  resultImage: imageOutput
                });
              } else {
                await this.computationRunRepository.update(compsToRun[i].id, {
                  runStatus: ComputationRunStatus.Error,
                  resultText: output
                });
              }
            }
          }

          resolve(true);
        } catch (e) {
          console.log('ERROR', e);
          if (e.toString().includes('Command failed')) {
            // Save computation run error
            await this.computationRunRepository.update(compsToRun[i].id, {
              runStatus: ComputationRunStatus.Error,
              resultText: Messages.COMPUTATION_RUN_ERROR
            });
          } else {
            // Set computation run to status pending again
            await this.computationRunRepository.update(compsToRun[i].id, { runStatus: ComputationRunStatus.Pending });
          }

          resolve(false);
        }
      });
      promises.push(promise);
    }

    if (promises.length > 0) {
      Promise.all(promises).then((values) => {
        console.log(values);
      });
    }

    return true;
  }

  async delete(id: number) {
    await this.computationRepository.delete(id);
  }

  async deleteComputationRun(id: number) {
    await this.computationRunRepository.delete(id);
  }

  // Computation Suggestions

  async findAllComputationSuggestions() {
    const [records, total] = await this.computationSuggestionRepository
      .createQueryBuilder('cs')
      .select(['cs.id', 'cs.suggestion', 'cs.createdAt', 'cs.updatedAt', 'user.id', 'user.firstName', 'user.lastName'])
      .leftJoin('cs.user', 'user')
      .orderBy('cs.updated_at', 'DESC')
      // .skip((page - 1) * pageSize)
      // .take(pageSize)
      .getManyAndCount();
    return { data: records, total };
  }

  async createSuggestion(createDto: ComputationSuggestionDto) {
    try {
      const user = await this.usersService.findOneBy({ id: createDto.userId });
      const newSuggestion = this.computationSuggestionRepository.create({ ...createDto, user });
      await this.computationSuggestionRepository.save(newSuggestion);

      return newSuggestion;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteComputationSuggestion(id: number) {
    await this.computationSuggestionRepository.delete(id);
  }
}
