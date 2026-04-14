import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JobDescriptionService } from '../service/JobDescriptionService';

@Controller('job-description')
export class JobDescriptionController {
    constructor(private readonly jobDescriptionService: JobDescriptionService) {}

    @Post('process-new-jobs')
    @HttpCode(HttpStatus.OK)
    async processNewJobs(): Promise<{ queued: number }> {
        const queued = await this.jobDescriptionService.dispatchProcessNewJobs();
        return { queued };
    }

    @Post('process-from-file')
    @HttpCode(HttpStatus.OK)
    async processFromFile(): Promise<void> {
        await this.jobDescriptionService.processFromFile();
    }
}
