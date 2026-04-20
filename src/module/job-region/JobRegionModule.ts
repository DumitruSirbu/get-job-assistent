import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRegion } from './entity/JobRegion';
import { JobRegionRepository } from './repository/JobRegionRepository';
import { JobRegionService } from './service/JobRegionService';
import { JobRegionController } from './controller/JobRegionController';

@Module({
    imports: [TypeOrmModule.forFeature([JobRegion])],
    controllers: [JobRegionController],
    providers: [JobRegionRepository, JobRegionService],
    exports: [JobRegionRepository],
})
export class JobRegionModule {}
