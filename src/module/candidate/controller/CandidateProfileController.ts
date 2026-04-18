import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PaginationDto } from 'lib/sdk/dto';
import { CandidateProfileService } from '../service/CandidateProfileService';
import { CandidateProfile } from '../entity/CandidateProfile';
import { ProcessCvDto } from '../dto/ProcessCvDto';

@Controller('candidate-profile')
export class CandidateProfileController {
    constructor(private readonly candidateProfileService: CandidateProfileService) {}

    @Get()
    async list(@Query() dto: PaginationDto) {
        return this.candidateProfileService.list(dto);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.candidateProfileService.findById(id);
    }

    @Post('process-cv')
    async processCV(@Body() body: ProcessCvDto): Promise<CandidateProfile> {
        return this.candidateProfileService.processCV(body.version);
    }
}
