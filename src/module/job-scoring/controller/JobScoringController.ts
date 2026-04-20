import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
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

    @Post('score-all')
    @HttpCode(HttpStatus.OK)
    async scoreAll(): Promise<IScoreAllJobsResponse> {
        return this.jobScoringService.scoreAllJobs();
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
