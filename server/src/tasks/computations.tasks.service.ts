import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComputationsService } from '../computations/computations.service';

@Injectable()
export class ComputationsTasksService {
  constructor(private readonly computationsService: ComputationsService) {}
  private readonly logger = new Logger(ComputationsTasksService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // Check total of computations to run
    const total = await this.computationsService.checkPendindComputations();
    if (total > 0) {
      this.logger.log(`Found ${total} computations to run.`);

      // Run pending computations
      this.computationsService.runPendindComputations();
    }
  }
}
