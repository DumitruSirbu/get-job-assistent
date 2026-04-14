import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OllamaModule } from '../ollama/OllamaModule';
import { JobModule } from '../job/JobModule';
import { CandidateProfile } from './entity/CandidateProfile';
import { CandidateProfileRepository } from './repository/CandidateProfileRepository';
import { CandidateProfileService } from './service/CandidateProfileService';
import { CandidateProfileController } from './controller/CandidateProfileController';

@Module({
    imports: [TypeOrmModule.forFeature([CandidateProfile]), OllamaModule, JobModule],
    controllers: [CandidateProfileController],
    providers: [CandidateProfileService, CandidateProfileRepository],
    exports: [CandidateProfileRepository],
})
export class CandidateModule {}
