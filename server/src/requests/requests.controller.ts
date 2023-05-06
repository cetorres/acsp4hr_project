import {
  Controller,
  UseGuards,
  Get,
  Req,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Put,
  BadRequestException,
  Delete,
  Param
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { Request } from 'express';
import { RequestDto } from './dto/request.dto';
import { RequestStatus } from './entities/request.entity';
import { ApproveRejectDto } from './dto/approve_reject.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('')
  findAllRequestsFromMeByUser(
    @Req() request: Request,
    @Query('datasetId') datasetId?: string | null,
    @Query('status') status?: RequestStatus | null
  ) {
    const requesterId = request.user['id'];

    if (datasetId != null) {
      return this.requestsService.findOneBy({ requester: { id: requesterId }, dataset: { id: datasetId } });
    }

    return this.requestsService.findAllByRequester(requesterId, status);
  }

  @Get('tome')
  findAllRequestsToMeByUser(@Req() request: Request, @Query('status') status?: RequestStatus | null) {
    return this.requestsService.findAllByOwner(request.user['id'], status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string, @Req() request: Request) {
    const requestObj = await this.requestsService.findOneBy({ id: id });
    const requester = await requestObj.requester;
    const owner = await requestObj.owner;
    if (requester.id != request.user['id'] && owner.id != request.user['id']) {
      throw new BadRequestException(
        'Request cannot be accessed by a user different than the requester or the owner of the dataset.'
      );
    }
    return requestObj;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: Request, @Body() createDto: RequestDto) {
    createDto.requesterId = request.user['id'];

    const savedRecord = await this.requestsService.create(createDto);
    return savedRecord;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async approveReject(@Req() request: Request, @Body() data: ApproveRejectDto) {
    if (data.ownerId != request.user['id']) {
      throw new BadRequestException('Request can only be approved/rejected by dataset owner.');
    }

    const savedRecord = await this.requestsService.approveReject(data);
    return savedRecord;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() request: Request) {
    const requestObj = await this.requestsService.findOneBy({ id: id });
    const user = await requestObj.requester;
    if (user.id != request.user['id']) {
      throw new BadRequestException('Request cannot be deleted by another user.');
    }

    return this.requestsService.delete(+id);
  }
}
