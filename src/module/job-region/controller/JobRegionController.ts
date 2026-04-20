import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateJobRegionDto, JobRegionDto, UpdateJobRegionDto } from '../../../../lib/sdk';
import { JobRegionService } from '../service/JobRegionService';

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true })
@Controller('job-region')
export class JobRegionController {
    constructor(private readonly jobRegionService: JobRegionService) {}

    @Get()
    async list() {
        const items = await this.jobRegionService.findAll();
        return { items: plainToInstance(JobRegionDto, items) };
    }

    @Post()
    async create(@Body() body: CreateJobRegionDto) {
        const region = await this.jobRegionService.create(body);
        return plainToInstance(JobRegionDto, region);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateJobRegionDto) {
        const region = await this.jobRegionService.update(id, body);
        return plainToInstance(JobRegionDto, region);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.jobRegionService.delete(id);
        return { success: true };
    }
}
