import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { OllamaModule } from '../ollama/OllamaModule';
import { AnthropicModule } from '../anthropic/AnthropicModule';
import { JobModule } from '../job/JobModule';
import { CandidateModule } from '../candidate/CandidateModule';
import { WsInfraModule } from '../ws/WsInfraModule';
import { JobMatchScore } from './entity/JobMatchScore';
import { ScorerModel } from './entity/ScorerModel';
import { JobMatchScoreRepository } from './repository/JobMatchScoreRepository';
import { ScorerModelRepository } from './repository/ScorerModelRepository';
import { JobScoringService } from './service/JobScoringService';
import { JobScoringRunSnapshotService } from './service/JobScoringRunSnapshotService';
import { JobScoringController } from './controller/JobScoringController';
import { JobScoringProcessor } from './queue/JobScoringProcessor';
import { JobScoringGateway } from './gateway/JobScoringGateway';
import { JOB_SCORING_QUEUE } from './const';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobMatchScore, ScorerModel]),
        BullModule.registerQueue({
            name: JOB_SCORING_QUEUE,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 10_000 },
                removeOnComplete: { age: 24 * 3600, count: 1000 },
                removeOnFail: { age: 7 * 24 * 3600 },
            },
        }),
        WsInfraModule,
        OllamaModule,
        AnthropicModule,
        JobModule,
        CandidateModule,
    ],
    controllers: [JobScoringController],
    providers: [JobScoringService, JobScoringRunSnapshotService, JobScoringGateway, JobMatchScoreRepository, ScorerModelRepository, JobScoringProcessor],
    exports: [JobMatchScoreRepository],
})
export class JobScoringModule {}
