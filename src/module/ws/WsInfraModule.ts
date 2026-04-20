import { Module } from '@nestjs/common';
import Redis from 'ioredis';

export const WS_REDIS_CLIENT = 'WS_REDIS_CLIENT';

@Module({
    providers: [
        {
            provide: WS_REDIS_CLIENT,
            useFactory: () =>
                new Redis({
                    host: process.env.REDIS_HOST ?? 'localhost',
                    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                }),
        },
    ],
    exports: [WS_REDIS_CLIENT],
})
export class WsInfraModule {}
