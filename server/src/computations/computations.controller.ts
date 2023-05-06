import {
  Controller,
  UseGuards,
  Get,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Req,
  Header,
  BadRequestException,
  Res
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ComputationsService } from './computations.service';
import { ComputationDto } from './dto/computation.dto';
import { Request, Response } from 'express';
import { ComputationRunDto } from './dto/computation_run.dto';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ComputationSuggestionDto } from './dto/computation_suggestion.dto';

const dataset_plot_images_dir = './dataset_plot_images/';

@Controller('computations')
@UseGuards(JwtAuthGuard)
export class ComputationsController {
  constructor(private readonly computationsService: ComputationsService) {}

  @Get()
  findAll() {
    return this.computationsService.findAll();
  }

  @Get('/get/:id')
  findComputationById(@Param('id') id: string) {
    return this.computationsService.findOneBy({ id: id });
  }

  @Get('/script/:id')
  findComputationScriptById(@Param('id') id: string) {
    return this.computationsService.getScriptById(+id);
  }

  @Get('/runs')
  findAllComputationRunsByRunner(@Req() request: Request) {
    const userId = request.user['id'];
    return this.computationsService.findAllComputationRunsBy({ runner: { id: userId } });
  }

  @Get('/runs/:id')
  findComputationRunsById(@Param('id') id: string, @Req() request: Request) {
    const userId = request.user['id'];
    return this.computationsService.findOneComputationRunBy({ id: id, runner: { id: userId } });
  }

  @Get('/runs/:id/result-image')
  @Header('Content-Disposition', 'attachment; filename="result_image"')
  async findComputationRunResultImageById(@Param('id') id: string, @Req() request: Request, @Res() res: Response) {
    const userId = request.user['id'];
    const cr = await this.computationsService.findOneComputationRunBy({
      id: id,
      runner: { id: userId }
    });

    const imageFilePath = dataset_plot_images_dir + cr.resultImage;
    const imageFile = createReadStream(join(process.cwd(), imageFilePath));
    if (cr.resultImage.includes('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (cr.resultImage.includes('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
    imageFile.pipe(res);
  }

  @Get('/admin/runs')
  findAllComputationRuns() {
    return this.computationsService.findAllComputationRuns();
  }

  @Get('/admin')
  @Roles(Role.Admin)
  findAllAdmin() {
    return this.computationsService.findAll(null);
  }

  @Get('/admin/runs/fill-up-runners')
  @Roles(Role.Admin)
  async fillUpRunners() {
    return this.computationsService.fillUpRunners();
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: ComputationDto) {
    const savedRecord = await this.computationsService.create(createDto);
    return savedRecord;
  }

  @Post('/runs')
  @HttpCode(HttpStatus.CREATED)
  async createComputationRun(@Body() createDto: ComputationRunDto, @Req() request: Request) {
    const runnerId = request.user['id'];
    const savedRecord = await this.computationsService.createComputationRun(createDto, Number(runnerId));
    return savedRecord;
  }

  @Put(':id')
  @Roles(Role.Admin)
  updateAdmin(@Param('id') id: string, @Body() updateDto: ComputationDto) {
    return this.computationsService.update(+id, updateDto);
  }

  @Put('/runs/:id')
  @Roles(Role.Admin)
  updateComputationRunAdmin(@Param('id') id: string, @Body() updateDto: ComputationRunDto) {
    return this.computationsService.updateComputationRun(+id, updateDto);
  }

  @Delete('/runs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeComputationRun(@Param('id') id: string, @Req() request: Request) {
    const userId = request.user['id'];
    const cr = await this.computationsService.findOneComputationRunBy({
      id: id,
      runner: { id: userId }
    });
    if (cr) {
      return this.computationsService.deleteComputationRun(+id);
    }
    throw new BadRequestException('Computation run cannot be deleted by another user.');
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAdmin(@Param('id') id: string) {
    return this.computationsService.delete(+id);
  }

  @Delete('/runs/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeComputationRunAdmin(@Param('id') id: string) {
    return this.computationsService.deleteComputationRun(+id);
  }

  // Computation Suggestions

  @Post('/suggestions')
  @HttpCode(HttpStatus.CREATED)
  async createSuggestion(@Body() createDto: ComputationSuggestionDto, @Req() request: Request) {
    const userId = request.user['id'];
    createDto.userId = userId;
    const savedRecord = await this.computationsService.createSuggestion(createDto);
    return savedRecord;
  }

  @Get('/admin/suggestions')
  @Roles(Role.Admin)
  findAllComputationSuggestions() {
    return this.computationsService.findAllComputationSuggestions();
  }

  @Delete('/admin/suggestions/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeComputationSuggestionAdmin(@Param('id') id: string) {
    return this.computationsService.deleteComputationSuggestion(+id);
  }
}
