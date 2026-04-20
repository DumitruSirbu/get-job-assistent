import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { OllamaModule } from '../ollama/OllamaModule';
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
        BullModule.registerQueue({ name: JOB_SCORING_QUEUE }),
        WsInfraModule,
        OllamaModule,
        JobModule,
        CandidateModule,
    ],
    controllers: [JobScoringController],
    providers: [JobScoringService, JobScoringRunSnapshotService, JobScoringGateway, JobMatchScoreRepository, ScorerModelRepository, JobScoringProcessor],
    exports: [JobMatchScoreRepository],
})
export class JobScoringModule {}
