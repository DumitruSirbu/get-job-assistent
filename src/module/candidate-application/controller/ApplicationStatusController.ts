import { Controller, Get } from '@nestjs/common';
import { CandidateApplicationService } from '../service/CandidateApplicationService';

@Controller('application-status')
export class ApplicationStatusController {
    constructor(private readonly candidateApplicationService: CandidateApplicationService) {}

    @Get()
    async listStatuses() {
        return await this.candidateApplicationService.listStatuses();
    }
}
