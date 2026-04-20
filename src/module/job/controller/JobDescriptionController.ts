import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ListJobFiltersDto, GetNewJobsParamsDto } from '../../../../lib/sdk/job/dto';
import { JobDescriptionService } from '../service/JobDescriptionService';

@Controller('job-description')
export class JobDescriptionController {
    constructor(private readonly jobDescriptionService: JobDescriptionService) {}

    @Get()
    async list(@Query() dto: ListJobFiltersDto) {
        return this.jobDescriptionService.listWithFilters(dto);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jobDescriptionService.findById(id);
    }

    @Post('process-new-jobs')
    @HttpCode(HttpStatus.OK)
    async processNewJobs(@Body() requestParams: GetNewJobsParamsDto) {
        return this.jobDescriptionService.dispatchProcessNewJobs(requestParams);
    }

    @Get('runs/:runId')
    async getRunSnapshot(@Param('runId') runId: string) {
        const snapshot = await this.jobDescriptionService.getJobScrapingRunSnapshot(runId);
        if (!snapshot) {
            throw new NotFoundException(`Run ${runId} not found or expired`);
        }

        return snapshot;
    }

    @Post('process-from-file')
    @HttpCode(HttpStatus.OK)
    async processFromFile(): Promise<void> {
        await this.jobDescriptionService.processFromFile();
    }
}
