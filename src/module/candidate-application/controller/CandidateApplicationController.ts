import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CandidateApplicationService } from '../service/CandidateApplicationService';
import { CreateCandidateApplicationDto } from '../dto/CreateCandidateApplicationDto';
import { UpdateCandidateApplicationDto } from '../dto/UpdateCandidateApplicationDto';

@Controller('candidate-profile')
export class CandidateApplicationController {
    constructor(private readonly candidateApplicationService: CandidateApplicationService) {}

    @Get(':candidateProfileId/applications')
    async listApplications(@Param('candidateProfileId', ParseIntPipe) candidateProfileId: number) {
        return await this.candidateApplicationService.listApplications(candidateProfileId);
    }

    @Post(':candidateProfileId/applications')
    async createApplication(@Param('candidateProfileId', ParseIntPipe) candidateProfileId: number, @Body() dto: CreateCandidateApplicationDto) {
        return await this.candidateApplicationService.createApplication(candidateProfileId, dto);
    }

    @Get(':candidateProfileId/applications/:applicationId')
    async findApplication(@Param('candidateProfileId', ParseIntPipe) candidateProfileId: number, @Param('applicationId', ParseIntPipe) applicationId: number) {
        return await this.candidateApplicationService.findApplication(candidateProfileId, applicationId);
    }

    @Patch(':candidateProfileId/applications/:applicationId')
    async updateApplication(
        @Param('candidateProfileId', ParseIntPipe) candidateProfileId: number,
        @Param('applicationId', ParseIntPipe) applicationId: number,
        @Body() dto: UpdateCandidateApplicationDto,
    ) {
        return await this.candidateApplicationService.updateApplication(candidateProfileId, applicationId, dto);
    }

    @Delete(':candidateProfileId/applications/:applicationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteApplication(
        @Param('candidateProfileId', ParseIntPipe) candidateProfileId: number,
        @Param('applicationId', ParseIntPipe) applicationId: number,
    ) {
        return await this.candidateApplicationService.deleteApplication(candidateProfileId, applicationId);
    }
}
