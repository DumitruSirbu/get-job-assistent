import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
import { ScoreNewestJobsRequestDto } from '../dto/ScoreNewestJobsRequestDto';
import { IScoreAllJobsResponse } from '../interface';
import { JobScoringService } from '../service/JobScoringService';
import { JobScoringRunSnapshotService } from '../service/JobScoringRunSnapshotService';

@Controller('job-scoring')
export class JobScoringController {
    constructor(
        private readonly jobScoringService: JobScoringService,
        private readonly jobScoringRunSnapshotService: JobScoringRunSnapshotService,
    ) {}

    @Get('candidate/:candidateId')
    async listForCandidate(@Param('candidateId', ParseIntPipe) candidateId: number, @Query() dto: ListScoresRequestDto) {
        return this.jobScoringService.listForCandidate(candidateId, dto);
    }

    @Post('score-newest-jobs/:candidateId')
    @HttpCode(HttpStatus.OK)
    async scoreNewestJobs(
        @Param('candidateId', ParseIntPipe) candidateId: number,
        @Body() requestParams: ScoreNewestJobsRequestDto,
    ): Promise<IScoreAllJobsResponse> {
        return this.jobScoringService.scoreNewestJobs(candidateId, requestParams);
    }

    @Get('scoring-run/:runId/snapshot')
    async getScoringRunSnapshot(@Param('runId') runId: string) {
        const snapshot = await this.jobScoringRunSnapshotService.getSnapshot(runId);
        if (!snapshot) {
            throw new NotFoundException(`Scoring run ${runId} not found or expired`);
        }
        return snapshot;
    }

    @Post('clear-queue')
    @HttpCode(HttpStatus.OK)
    async clearQueue(): Promise<{ cleared: boolean }> {
        return this.jobScoringService.clearQueue();
    }
}
