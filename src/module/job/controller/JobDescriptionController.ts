import { Controller, Get } from '@nestjs/common';
import { JobDescriptionService } from '../service/JobDescriptionService';

@Controller('job-description')
export class JobDescriptionController {
    constructor(private readonly jobDescriptionService: JobDescriptionService) {}

    @Get('process-new-jobs')
    async processNewJobs(): Promise<{ queued: number }> {
        const queued = await this.jobDescriptionService.dispatchProcessNewJobs();
        return { queued };
    }

    @Get('process-from-file')
    async processFromFile(): Promise<void> {
        await this.jobDescriptionService.processFromFile();
    }
}
