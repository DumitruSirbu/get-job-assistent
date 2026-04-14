import { Body, Controller, Post } from '@nestjs/common';
import { CandidateProfileService } from '../service/CandidateProfileService';
import { CandidateProfile } from '../entity/CandidateProfile';
import { ProcessCvDto } from '../dto/ProcessCvDto';

@Controller('candidate-profile')
export class CandidateProfileController {
    constructor(private readonly candidateProfileService: CandidateProfileService) {}

    @Post('process-cv')
    async processCV(@Body() body: ProcessCvDto): Promise<CandidateProfile> {
        return this.candidateProfileService.processCV(body.version);
    }
}
