import { Controller } from '@nestjs/common';
import { JobDescriptionService } from '../service/JobDescriptionService';

@Controller('job-description')
export class JobDescriptionController {
    constructor(private readonly jobDescriptionService: JobDescriptionService) {}
}
