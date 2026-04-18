import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ListJobFiltersDto } from 'lib/sdk/dto';
import { GetNewJobsParamsDto } from 'lib/sdk/dto';
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
    async processNewJobs(@Body() requestParams: GetNewJobsParamsDto): Promise<{ queued: number }> {
        const queued = await this.jobDescriptionService.dispatchProcessNewJobs(requestParams);
        return { queued };
    }

    @Post('process-from-file')
    @HttpCode(HttpStatus.OK)
    async processFromFile(): Promise<void> {
        await this.jobDescriptionService.processFromFile();
    }
}
