import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
import { IScoreAllJobsResponse } from '../interface';
import { JobScoringService } from '../service/JobScoringService';

@Controller('job-scoring')
export class JobScoringController {
    constructor(private readonly jobScoringService: JobScoringService) {}

    @Get('candidate/:candidateId')
    async listForCandidate(@Param('candidateId', ParseIntPipe) candidateId: number, @Query() dto: ListScoresRequestDto) {
        return this.jobScoringService.listForCandidate(candidateId, dto);
    }

    @Post('score-all')
    @HttpCode(HttpStatus.OK)
    async scoreAll(): Promise<IScoreAllJobsResponse> {
        return this.jobScoringService.scoreAllJobs();
    }

    @Post('clear-queue')
    @HttpCode(HttpStatus.OK)
    async clearQueue(): Promise<{ cleared: boolean }> {
        return this.jobScoringService.clearQueue();
    }
}
