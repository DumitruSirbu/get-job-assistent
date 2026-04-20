import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { IJobScrapingSnapshotPayload, IJobScrapingLocationState } from '../../../../lib/sdk/ws/interface';
import { JobScrapingRunStatusEnum } from '../../../../lib/sdk/ws/enum/JobScrapingRunStatusEnum';
import { JobScrapingLocationStatusEnum } from '../../../../lib/sdk/ws/enum/JobScrapingLocationStatusEnum';
import { WS_REDIS_CLIENT } from '../../ws/WsInfraModule';
import type { IJobScrapingCounters } from '../interface/IJobScrapingCounters';

const RUNNING_TTL_SECONDS = 86400;

@Injectable()
export class JobScrapingRunSnapshotService {
    private readonly logger = new Logger(JobScrapingRunSnapshotService.name);
    private readonly finishedTtl = parseInt(process.env.JOB_SCRAPING_RUN_TTL_SECONDS ?? '3600', 10);

    constructor(@Inject(WS_REDIS_CLIENT) private readonly redis: Redis) {}

    async create(runId: string, totalLocations: number, locations: string[]): Promise<void> {
        const pipe = this.redis.pipeline();
        pipe.hset(this.key(runId), {
            runId,
            status: JobScrapingRunStatusEnum.RUNNING,
            locations: JSON.stringify(locations),
            totalLocations,
            completedLocations: 0,
            failedLocations: 0,
            totalFoundJobs: 0,
            startedAt: new Date().toISOString(),
        });
        pipe.expire(this.key(runId), RUNNING_TTL_SECONDS);
        pipe.del(this.locKey(runId));
        await pipe.exec();
    }

    async incrementCompleted(runId: string, foundJobs: number, location: string): Promise<IJobScrapingCounters> {
        const pipe = this.redis.pipeline();
        pipe.hincrby(this.key(runId), 'completedLocations', 1);
        pipe.hincrby(this.key(runId), 'totalFoundJobs', foundJobs);
        pipe.hmget(this.key(runId), 'failedLocations', 'totalLocations');
        pipe.hset(
            this.locKey(runId),
            location,
            JSON.stringify({ status: JobScrapingLocationStatusEnum.COMPLETED, foundJobs } satisfies IJobScrapingLocationState),
        );
        pipe.expire(this.locKey(runId), RUNNING_TTL_SECONDS);
        const results = (await pipe.exec())!;

        const completedLocations = results[0][1] as number;
        const totalFoundJobs = results[1][1] as number;
        const [failedStr, totalStr] = results[2][1] as string[];
        return {
            completedLocations,
            totalFoundJobs,
            failedLocations: parseInt(failedStr ?? '0', 10),
            totalLocations: parseInt(totalStr ?? '0', 10),
        };
    }

    async incrementFailed(runId: string, location: string, error: string): Promise<IJobScrapingCounters> {
        const pipe = this.redis.pipeline();
        pipe.hincrby(this.key(runId), 'failedLocations', 1);
        pipe.hmget(this.key(runId), 'completedLocations', 'totalLocations', 'totalFoundJobs');
        pipe.hset(this.locKey(runId), location, JSON.stringify({ status: JobScrapingLocationStatusEnum.FAILED, error } satisfies IJobScrapingLocationState));
        pipe.expire(this.locKey(runId), RUNNING_TTL_SECONDS);
        const results = (await pipe.exec())!;

        const failedLocations = results[0][1] as number;
        const [completedStr, totalStr, foundStr] = results[1][1] as string[];
        return {
            failedLocations,
            completedLocations: parseInt(completedStr ?? '0', 10),
            totalLocations: parseInt(totalStr ?? '0', 10),
            totalFoundJobs: parseInt(foundStr ?? '0', 10),
        };
    }

    async markFinished(runId: string, status: JobScrapingRunStatusEnum): Promise<void> {
        const pipe = this.redis.pipeline();
        pipe.hset(this.key(runId), { status, finishedAt: new Date().toISOString() });
        pipe.expire(this.key(runId), this.finishedTtl);
        pipe.expire(this.locKey(runId), this.finishedTtl);
        await pipe.exec();
    }

    async getSnapshot(runId: string): Promise<IJobScrapingSnapshotPayload | null> {
        const [data, locRaw] = await Promise.all([this.redis.hgetall(this.key(runId)), this.redis.hgetall(this.locKey(runId))]);

        if (!data?.runId) {
            return null;
        }

        const locationStates: Record<string, IJobScrapingLocationState> = {};
        for (const [name, json] of Object.entries(locRaw ?? {})) {
            try {
                locationStates[name] = JSON.parse(json) as IJobScrapingLocationState;
            } catch {
                this.logger.warn(`Failed to parse location state for "${name}" in run ${runId}`);
            }
        }

        return {
            runId: data.runId,
            status: data.status as unknown as JobScrapingRunStatusEnum,
            locations: JSON.parse(data.locations ?? '[]') as string[],
            locationStates: Object.keys(locationStates).length > 0 ? locationStates : undefined,
            totalLocations: parseInt(data.totalLocations, 10),
            completedLocations: parseInt(data.completedLocations, 10),
            failedLocations: parseInt(data.failedLocations, 10),
            totalFoundJobs: parseInt(data.totalFoundJobs, 10),
            startedAt: data.startedAt,
            finishedAt: data.finishedAt,
        };
    }

    private key(runId: string): string {
        return `job-scraping:run:${runId}`;
    }

    private locKey(runId: string): string {
        return `job-scraping:run:${runId}:loc-states`;
    }
}
