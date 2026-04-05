import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApifyClient } from 'apify-client';
import { ApifyLinkedinJobsService } from './service/ApifyLinkedinJobsService';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'APIFY_CLIENT',
            useFactory: (configService: ConfigService) => {
                const token = configService.get<string>('APIFY_TOKEN');
                if (!token) {
                    throw new Error('APIFY_TOKEN is not set in the environment variables');
                }
                return new ApifyClient({
                    token,
                });
            },
            inject: [ConfigService],
        },
        ApifyLinkedinJobsService,
    ],
    exports: ['APIFY_CLIENT', ApifyLinkedinJobsService],
})
export class ApifyModule {}
