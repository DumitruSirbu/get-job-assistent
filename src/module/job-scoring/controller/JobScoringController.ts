import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IScoreAllJobsResponse } from '../interface';
import { JobScoringService } from '../service/JobScoringService';

@Controller('job-scoring')
export class JobScoringController {
    constructor(private readonly jobScoringService: JobScoringService) {}

    @Post('score-all')
    @HttpCode(HttpStatus.OK)
    async scoreAll(): Promise<IScoreAllJobsResponse> {
        return this.jobScoringService.scoreAllJobs();
    }
}
