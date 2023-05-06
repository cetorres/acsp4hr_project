import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { UsersService } from 'src/users/users.service';
import { encryptDecryptFile } from 'src/utils/file-crypto.utils';
import { getDatasetInfo, removeFile } from 'src/utils/file.utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatasetsService } from './datasets.service';
import { DatasetDto } from './dto';
import { DatasetUpdateDto } from './dto/dataset.update.dto';

const fileValidators = [new MaxFileSizeValidator({ maxSize: 100000000 }), new FileTypeValidator({ fileType: 'csv' })];
const destination = './dataset_files';
const destination_temp = './dataset_files_temp';

@Controller('datasets')
@UseGuards(JwtAuthGuard)
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService, private readonly usersService: UsersService) {}

  @Get()
  findAllByUser(@Req() request: Request) {
    return this.datasetsService.findAllByUser(request.user['id']);
  }

  @Get('browse')
  browseAll(@Req() request: Request, @Query('s') searchText?: string | null) {
    return this.datasetsService.browseAll(request.user['id'], searchText);
  }

  @Get('browse/:id')
  findOne(@Param('id') id: string) {
    return this.datasetsService.browseOneBy(id);
  }

  @Get('my/:id')
  async findMy(@Param('id') id: string, @Req() request: Request) {
    const dataset = await this.datasetsService.findOneBy({ id: id });
    const datasetUser = await dataset.user;
    if (datasetUser.id != request.user['id']) {
      throw new BadRequestException('Dataset cannot be accessed by another user.');
    }
    return this.datasetsService.browseOneBy(id, true);
  }

  @Get('my/data/:id')
  async findMyData(@Param('id') id: string, @Req() request: Request) {
    const dataset = await this.datasetsService.findOneBy({ id: id });
    const datasetUser = await dataset.user;
    if (datasetUser.id != request.user['id']) {
      throw new BadRequestException('Dataset cannot be accessed by another user.');
    }

    return await getDatasetInfo(destination, dataset.filename, false);
  }

  @Get('favorites')
  async getFavorites(@Req() request: Request) {
    return this.datasetsService.getFavorites(request.user['id']);
  }

  @Get('favorites/:id')
  async isFavorite(@Req() request: Request, @Param('id') id: string) {
    return this.datasetsService.isFavorite(request.user['id'], +id);
  }

  @Post('favorites/:id')
  async addFavorites(@Req() request: Request, @Param('id') id: string) {
    return this.datasetsService.addFavorite(request.user['id'], +id);
  }

  @Delete('favorites/:id')
  async removeFavorites(@Req() request: Request, @Param('id') id: string) {
    return this.datasetsService.removeFavorite(request.user['id'], +id);
  }

  @Post('info')
  @UseInterceptors(FileInterceptor('datasetFile', { storage: diskStorage({ destination: destination_temp }) }))
  async getInfo(
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipe({
        // eslint-disable-next-line prettier/prettier
        validators: fileValidators,
      })
    )
    datasetFile: Express.Multer.File
  ) {
    return await getDatasetInfo(destination_temp, datasetFile.filename);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('datasetFile', { storage: diskStorage({ destination }) }))
  async create(
    @Req() request: Request,
    @Body() createDto: DatasetDto,
    @UploadedFile(
      new ParseFilePipe({
        // eslint-disable-next-line prettier/prettier
        validators: fileValidators,
      })
    )
    datasetFile: Express.Multer.File
  ) {
    createDto.userId = request.user['id'];
    createDto.documentName = datasetFile.originalname;
    createDto.filename = datasetFile.filename;
    createDto.documentSize = datasetFile.size;

    // Encrypt datasetFile
    const userId = request.user['id'];
    const user = await this.usersService.findOneBy({ id: userId }, true);
    const filePath = destination + '/' + datasetFile.filename;
    const result = encryptDecryptFile(false, filePath, filePath, user.salt, user.secureToken);
    if (!result) {
      removeFile(destination, datasetFile.filename);
      throw new BadRequestException('Could not encrypt dataset file.');
    }
    // encryptDecryptFile(true, filePath, filePath + '.dec', user.salt, password);

    const savedRecord = await this.datasetsService.create(createDto);
    return savedRecord;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() request: Request, @Body() updateDto: DatasetUpdateDto) {
    const dataset = await this.datasetsService.findOneBy({ id: id });
    const datasetUser = await dataset.user;
    if (datasetUser.id != request.user['id']) {
      throw new BadRequestException('Dataset cannot be updated by another user.');
    }

    return this.datasetsService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() request: Request) {
    const dataset = await this.datasetsService.findOneBy({ id: id });
    const datasetUser = await dataset.user;
    if (datasetUser.id != request.user['id']) {
      throw new BadRequestException('Dataset cannot be deleted by another user.');
    }

    const result = await this.datasetsService.delete(+id);
    if (result.affected > 0) {
      removeFile(destination, dataset.filename);
    }
  }

  @Put(':id/admin')
  @Roles(Role.Admin)
  updateAdmin(@Param('id') id: string, @Body() updateDto: DatasetUpdateDto) {
    return this.datasetsService.update(+id, updateDto);
  }

  @Delete(':id/admin')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAdmin(@Param('id') id: string) {
    const dataset = await this.datasetsService.findOneBy({ id: id });
    removeFile(destination, dataset.filename);
    return this.datasetsService.delete(+id);
  }

  @Get('/admin/encrypt-datasets')
  @Roles(Role.Admin)
  async fillUpSecureToken() {
    return this.datasetsService.encryptDatasets(destination);
  }
}
