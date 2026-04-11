import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApifyModule } from './module/apify/ApifyModule';
import { postgresConnectionConfig } from './config/ormconfig';
import { JobModule } from './module/job/JobModule';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(postgresConnectionConfig), ApifyModule, JobModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
