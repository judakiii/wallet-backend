import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}
  getHello(): string {
    return 'Hello World!';
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'dynamicCron' })
  handleCron() {
    this.logger.debug('dynamicCron');
  }

  stopJob() {
    const job = this.schedulerRegistry.getCronJob('dynamicCron');
    job.stop();
  }
}
