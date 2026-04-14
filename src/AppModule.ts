import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApifyModule } from './module/apify/ApifyModule';
import { bullmqRootConfig } from './config/bullmqConfig';
import { postgresConnectionConfig } from './config/ormconfig';
import { JobModule } from './module/job/JobModule';
import { CandidateModule } from './module/candidate/CandidateModule';
import { JobScoringModule } from './module/job-scoring/JobScoringModule';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(postgresConnectionConfig),
        BullModule.forRoot(bullmqRootConfig),
        ApifyModule,
        JobModule,
        CandidateModule,
        JobScoringModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
