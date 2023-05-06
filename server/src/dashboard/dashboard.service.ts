import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DatasetsService } from '../datasets/datasets.service';
import { RequestsService } from 'src/requests/requests.service';
import { ComputationsService } from 'src/computations/computations.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly datasetsService: DatasetsService,
    private readonly usersService: UsersService,
    private readonly requestsService: RequestsService,
    private readonly computationsService: ComputationsService
  ) {}

  async getTotals() {
    const totalDatasets = await this.datasetsService.countAll();
    const totalUsers = await this.usersService.countAll();
    const totalRequests = await this.requestsService.countAll();
    const totalComputations = await this.computationsService.countAllComputationRuns();

    return {
      datasets: totalDatasets,
      users: totalUsers,
      requests: totalRequests,
      computations: totalComputations
    };
  }
}
