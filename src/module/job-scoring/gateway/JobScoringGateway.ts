import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { JOB_SCORING_NAMESPACE, JobScoringClientEvent, JobScoringServerEvent } from '../../../../lib/sdk/ws/consts';
import { JobScrapingLocationStatusEnum } from '../../../../lib/sdk/ws/enum/JobScrapingLocationStatusEnum';
import { JobScoringRunStatusEnum } from '../../../../lib/sdk/ws/enum';
import type { IJobScoringCounters } from '../../../../lib/sdk/ws/interface/IJobScoringCounters';
import type {
    IJobScoringFinishedPayload,
    IJobScoringItemCompletedPayload,
    IJobScoringItemFailedPayload,
    IJobScoringStartedPayload,
    IJobScoringSubscribePayload,
} from '../../../../lib/sdk/ws/interface';
import { Public } from 'src/module/auth/decorator/Public';
import { JobScoringRunSnapshotService } from '../service/JobScoringRunSnapshotService';

@Public()
@WebSocketGateway({
    namespace: JOB_SCORING_NAMESPACE,
    cors: {
        origin: [process.env.DASHBOARD_URL],
        credentials: true,
    },
})
export class JobScoringGateway {
    private readonly logger = new Logger(JobScoringGateway.name);

    @WebSocketServer()
    private readonly server: Server;

    constructor(private readonly snapshotService: JobScoringRunSnapshotService) {}

    @SubscribeMessage(JobScoringClientEvent.SUBSCRIBE)
    async handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() payload: IJobScoringSubscribePayload): Promise<{ ok: boolean }> {
        if (!payload?.runId) {
            return { ok: false };
        }

        await client.join(this.roomFor(payload.runId));
        this.logger.log(`Client ${client.id} subscribed to scoring run ${payload.runId}`);

        const snapshot = await this.snapshotService.getSnapshot(payload.runId);
        if (snapshot) {
            client.emit(JobScoringServerEvent.SNAPSHOT, snapshot);
        }

        return { ok: true };
    }

    async emitStarted(payload: IJobScoringStartedPayload): Promise<void> {
        await this.snapshotService.create(payload.runId, payload.totalJobs);
        this.server.to(this.roomFor(payload.runId)).emit(JobScoringServerEvent.STARTED, payload);
    }

    async emitItemCompleted(runId: string, jobDescriptionId: number, score: number): Promise<void> {
        const [counters] = await Promise.all([
            this.snapshotService.incrementCompleted(runId),
            this.snapshotService.addItem(runId, { jobDescriptionId, status: JobScrapingLocationStatusEnum.COMPLETED, score }),
        ]);

        const payload: IJobScoringItemCompletedPayload = {
            runId,
            jobDescriptionId,
            score,
            completedItems: counters.completedItems,
            totalJobs: counters.totalJobs,
        };
        this.server.to(this.roomFor(runId)).emit(JobScoringServerEvent.ITEM_COMPLETED, payload);

        await this.maybeFinish(runId, counters);
    }

    async emitItemFailed(runId: string, jobDescriptionId: number, error: string): Promise<void> {
        const [counters] = await Promise.all([
            this.snapshotService.incrementFailed(runId),
            this.snapshotService.addItem(runId, { jobDescriptionId, status: JobScrapingLocationStatusEnum.FAILED, error }),
        ]);

        const payload: IJobScoringItemFailedPayload = {
            runId,
            jobDescriptionId,
            error,
            completedItems: counters.completedItems,
            failedItems: counters.failedItems,
            totalJobs: counters.totalJobs,
        };
        this.server.to(this.roomFor(runId)).emit(JobScoringServerEvent.ITEM_FAILED, payload);

        await this.maybeFinish(runId, counters);
    }

    private async maybeFinish(runId: string, counters: IJobScoringCounters): Promise<void> {
        if (counters.completedItems + counters.failedItems < counters.totalJobs) {
            return;
        }

        const status =
            counters.failedItems === 0
                ? JobScoringRunStatusEnum.SUCCESS
                : counters.completedItems === 0
                  ? JobScoringRunStatusEnum.FAIL
                  : JobScoringRunStatusEnum.PARTIAL;

        const emitted = await this.snapshotService.tryMarkFinishedOnce(runId, status);
        if (!emitted) {
            return;
        }

        const finishedPayload: IJobScoringFinishedPayload = {
            runId,
            status,
            completedItems: counters.completedItems,
            failedItems: counters.failedItems,
            totalJobs: counters.totalJobs,
        };
        this.server.to(this.roomFor(runId)).emit(JobScoringServerEvent.FINISHED, finishedPayload);
        void this.server.in(this.roomFor(runId)).socketsLeave(this.roomFor(runId));
    }

    private roomFor(runId: string): string {
        return `run:${runId}`;
    }
}
