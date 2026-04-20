import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { JobScoringRunStatusEnum } from '../../../../lib/sdk/ws/enum';
import type { IJobScoringSnapshotPayload } from '../../../../lib/sdk/ws/interface';
import { WS_REDIS_CLIENT } from '../../ws/WsInfraModule';

const RUNNING_TTL_SECONDS = 86400;

@Injectable()
export class JobScoringRunSnapshotService {
    private readonly logger = new Logger(JobScoringRunSnapshotService.name);
    private readonly finishedTtl = parseInt(process.env.JOB_SCORING_RUN_TTL_SECONDS ?? '3600', 10);

    constructor(@Inject(WS_REDIS_CLIENT) private readonly redis: Redis) {}

    async create(runId: string, totalJobs: number): Promise<void> {
        await this.redis.hset(this.key(runId), {
            runId,
            status: JobScoringRunStatusEnum.RUNNING,
            totalJobs,
            completedItems: 0,
            failedItems: 0,
            startedAt: new Date().toISOString(),
        });
        await this.redis.expire(this.key(runId), RUNNING_TTL_SECONDS);
    }

    async incrementCompleted(runId: string): Promise<{ completedItems: number; failedItems: number; totalJobs: number }> {
        const pipe = this.redis.pipeline();
        pipe.hincrby(this.key(runId), 'completedItems', 1);
        pipe.hmget(this.key(runId), 'failedItems', 'totalJobs');
        const results = (await pipe.exec())!;

        const completedItems = results[0][1] as number;
        const [failedStr, totalStr] = results[1][1] as string[];
        return {
            completedItems,
            failedItems: parseInt(failedStr ?? '0', 10),
            totalJobs: parseInt(totalStr ?? '0', 10),
        };
    }

    async incrementFailed(runId: string): Promise<{ completedItems: number; failedItems: number; totalJobs: number }> {
        const pipe = this.redis.pipeline();
        pipe.hincrby(this.key(runId), 'failedItems', 1);
        pipe.hmget(this.key(runId), 'completedItems', 'totalJobs');
        const results = (await pipe.exec())!;

        const failedItems = results[0][1] as number;
        const [completedStr, totalStr] = results[1][1] as string[];
        return {
            completedItems: parseInt(completedStr ?? '0', 10),
            failedItems,
            totalJobs: parseInt(totalStr ?? '0', 10),
        };
    }

    async markFinished(runId: string, status: JobScoringRunStatusEnum): Promise<void> {
        await this.redis.hset(this.key(runId), { status, finishedAt: new Date().toISOString() });
        await this.redis.expire(this.key(runId), this.finishedTtl);
    }

    async tryMarkFinishedOnce(runId: string, status: JobScoringRunStatusEnum): Promise<boolean> {
        const guardKey = `${this.key(runId)}:finished-guard`;
        const acquired = await this.redis.set(guardKey, '1', 'EX', this.finishedTtl, 'NX');
        if (!acquired) {
            return false;
        }
        await this.markFinished(runId, status);
        return true;
    }

    async getSnapshot(runId: string): Promise<IJobScoringSnapshotPayload | null> {
        const data = await this.redis.hgetall(this.key(runId));
        if (!data?.runId) {
            return null;
        }

        return {
            runId: data.runId,
            status: data.status as unknown as JobScoringRunStatusEnum,
            totalJobs: parseInt(data.totalJobs, 10),
            completedItems: parseInt(data.completedItems, 10),
            failedItems: parseInt(data.failedItems, 10),
            startedAt: data.startedAt,
            finishedAt: data.finishedAt,
        };
    }

    private key(runId: string): string {
        return `job-scoring:run:${runId}`;
    }
}
