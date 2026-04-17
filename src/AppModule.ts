import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApifyModule } from './module/apify/ApifyModule';
import { bullmqRootConfig } from './config/bullmqConfig';
import { postgresConnectionConfig } from './config/ormconfig';
import { JobModule } from './module/job/JobModule';
import { CompanyModule } from './module/company/CompanyModule';
import { CandidateModule } from './module/candidate/CandidateModule';
import { JobScoringModule } from './module/job-scoring/JobScoringModule';
import { UserModule } from './module/user/UserModule';
import { AuthModule } from './module/auth/AuthModule';
import { JwtAuthGuard } from './module/auth/guard/JwtAuthGuard';
import { CandidateApplicationModule } from './module/candidate-application/CandidateApplicationModule';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(postgresConnectionConfig),
        BullModule.forRoot(bullmqRootConfig),
        ApifyModule,
        JobModule,
        CompanyModule,
        CandidateModule,
        CandidateApplicationModule,
        JobScoringModule,
        UserModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
